#ARQUIVO BASE -> DEFINIÇÃO DE ROTAS, LIGAÇÃO COM API E ETC
import io
import matplotlib.pyplot as plt
from flask import Flask, render_template, request, redirect, url_for, Response
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

@app.route('/result', methods=['POST'])
def result():
    sequence = request.form.get("sequence", "").upper().strip()

    if not sequence or any(base not in "ATCG" for base in sequence):
        return redirect(url_for('error'))

    seq = Seq(sequence)
    counts = {base: seq.count(base) for base in "ATCG"}
    gc_content = round(gc_fraction(seq) * 100, 2)
    start_codon = seq.find("ATG")

    return render_template(
        'result.html',
        sequence=sequence,
        counts=counts,
        gc_content=gc_content,
        start_codon=start_codon if start_codon != -1 else None
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

if __name__ == '__main__':
    app.run(debug=True)
