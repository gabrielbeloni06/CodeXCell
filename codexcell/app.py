#ARQUIVO BASE -> DEFINIÇÃO DE ROTAS, LIGAÇÃO COM API E ETC
import io
import matplotlib.pyplot as plt
from flask import Flask, render_template, request, redirect, url_for, Response
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from collections import Counter
import re
import json

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

@app.route("/load_sample/<sample_id>")
def load_sample(sample_id):
    with open("data/samples.json") as f:
        data = json.load(f)
    for gene in data["genes"]:
        if gene["id"] == sample_id:
            return render_template("analyze.html", sample=gene)
    return "Exemplo não encontrado", 404

@app.route('/result', methods=['POST'])
def result():
    sequence = request.form.get("sequence", "").upper().strip()

    if not sequence or any(base not in "ATCG" for base in sequence):
        return redirect(url_for('error'))

    seq = Seq(sequence)
    counts = {base: seq.count(base) for base in "ATCG"}
    gc_content = round(gc_fraction(seq) * 100, 2)
    start_codon = seq.find("ATG")
    orfs = find_orfs(sequence)
    repeats = find_repeats(sequence)
    sequence1 = request.form.get("sequence", "").upper().strip()
    sequence2 = request.form.get("sequence2", "").upper().strip()
    gc_windows = gc_content_sliding_window(sequence, window_size=10)
    comparison = None
    if sequence2:
        comparison = compare_sequences(sequence1, sequence2)
    codons = codon_usage(sequence)
    motifs = find_motifs(sequence)

    return render_template(
        'result.html',
        sequence=sequence,
        counts=counts,
        gc_content=gc_content,
        start_codon=start_codon if start_codon != -1 else None,
        orfs=orfs,
        repeats=repeats,
        comparison=comparison,
        gc_windows=gc_windows,
        codons=codons,
        motifs=motifs
    )


@app.route('/plot.png')
def plot_png():
    sequence = request.args.get("seq", "")
    seq = Seq(sequence)
    counts = [seq.count(base) for base in "ATCG"]
    fig, ax = plt.subplots()
    ax.bar(["A", "T", "C", "G"], counts, color=["green", "red", "blue", "orange"])
    ax.set_title("Frequência de Nucleotídeos")
    ax.set_ylabel("Contagem")
    output = io.BytesIO()
    plt.savefig(output, format="png")
    plt.close(fig)
    output.seek(0)
    return Response(output.getvalue(), mimetype="image/png")

@app.route('/error')
def error():
    return render_template('error.html')

def find_orfs(sequence):
    stop_codons = ["TAA", "TAG", "TGA"]
    orfs = []
    seq_len = len(sequence)
    for frame in range(3):
        i = frame
        while i < seq_len - 2:
            codon = sequence[i:i+3]
            if codon == "ATG":
                for j in range(i+3, seq_len-2, 3):
                    stop = sequence[j:j+3]
                    if stop in stop_codons:
                        subseq = sequence[i:j+3]
                        protein = str(Seq(subseq).translate(to_stop=True))
                        analysis = analyze_protein(protein)
                        orfs.append({
                            "start": i,
                            "end": j+3,
                            "length": (j+3 - i),
                            "frame": frame+1,
                            "protein": protein,
                            "analysis": analysis
                        })
                        i = j+3
                        break
            i += 3
    return orfs

def find_repeats(sequence, min_motif=2, max_motif=6, min_repeats=3):
    repeats = []
    seq_len = len(sequence)

    for motif_len in range(min_motif, max_motif+1):
        for i in range(seq_len - motif_len*min_repeats + 1):
            motif = sequence[i:i+motif_len]
            count = 1
            j = i + motif_len
            while j + motif_len <= seq_len and sequence[j:j+motif_len] == motif:
                count += 1
                j += motif_len
            if count >= min_repeats:
                repeats.append({
                    "motif": motif,
                    "start": i,
                    "end": j,
                    "repeats": count
                })
    return repeats

def compare_sequences(seq1, seq2):
    length = min(len(seq1), len(seq2))
    matches = 0
    alignment = []
    for i in range(length):
        if seq1[i] == seq2[i]:
            alignment.append("|")
            matches += 1
        else:
            alignment.append(" ")
    identity = round((matches / length) * 100, 2) if length > 0 else 0
    return {
        "seq1": seq1[:length],
        "seq2": seq2[:length],
        "alignment": "".join(alignment),
        "identity": identity
    }

def gc_content_sliding_window(sequence, window_size=50):
    values = []
    for i in range(0, len(sequence) - window_size + 1, window_size):
        window = sequence[i:i+window_size]
        gc = (window.count("G") + window.count("C")) / len(window) * 100
        values.append({"start": i, "end": i+window_size, "gc": round(gc, 2)})
    return values

from collections import Counter

def codon_usage(sequence):
    codons = []
    for i in range(0, len(sequence) - 2, 3):
        codon = sequence[i:i+3]
        if len(codon) == 3:
            codons.append(codon)
    counts = Counter(codons)
    # Retorna os 10 mais comuns
    return counts.most_common(10)

aa_weights = {
    "A": 89.1, "R": 174.2, "N": 132.1, "D": 133.1, "C": 121.2,
    "E": 147.1, "Q": 146.2, "G": 75.1, "H": 155.2, "I": 131.2,
    "L": 131.2, "K": 146.2, "M": 149.2, "F": 165.2, "P": 115.1,
    "S": 105.1, "T": 119.1, "W": 204.2, "Y": 181.2, "V": 117.1
}

def analyze_protein(protein_seq):
    counts = Counter(protein_seq)
    total = sum(counts.values())
    freq = {aa: round((counts[aa]/total)*100, 2) for aa in counts}
    weight = round(sum(aa_weights.get(aa, 0) for aa in protein_seq), 2)
    return {"length": total, "freq": freq, "weight": weight}

def find_motifs(sequence):
    motifs = []
    patterns = {
        "TATA box": "TATAAA",
        "CAAT box": "GGCCAATCT",
        "Kozak sequence": r"GCC[AG]CCATGG"
    }
    for name, pattern in patterns.items():
        for match in re.finditer(pattern, sequence):
            motifs.append({
                "motif": name,
                "start": match.start(),
                "end": match.end(),
                "sequence": match.group()
            })
    return motifs




if __name__ == '__main__':
    app.run(debug=True)
