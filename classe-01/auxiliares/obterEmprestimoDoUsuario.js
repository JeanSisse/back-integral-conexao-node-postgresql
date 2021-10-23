const conexao = require('../conexao');

const obterEmprestimosDoUsuario = async ( usuario ) => {
  const { rows: emprestimos } = await conexao.query('select * from emprestimos where usuario_id = $1', [usuario.id]);

  for (emprestimo of emprestimos) {
    const { rows: livro } = await conexao.query('select * from livros where id = $1', [emprestimo.livro_id]);
    emprestimo.livro = livro[0].nome;
  }

  return emprestimos;
}

module.exports = {
  obterEmprestimosDoUsuario
}