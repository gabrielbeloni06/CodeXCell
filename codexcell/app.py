#ARQUIVO BASE -> DEFINIÇÃO DE ROTAS, LIGAÇÃO COM API E ETC
from flask import Flask, render_template, request, redirect, url_for
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
app = Flask(__name__)

#Rota homepage
@app.route('/')
def home():
    return render_template('index.html')

# Rota de entrada (formulário)
@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

# Rota de resultado
@app.route('/result', methods=['POST'])
def result():
    sequence = request.form.get("sequence", "").upper().strip()
    if not sequence or any(base not in "ATCG" for base in sequence):
        return redirect(url_for('error'))

    #Biopython
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
@app.route('/error')
def error():
    return render_template('error.html')

if __name__ == '__main__':
    app.run(debug=True)
