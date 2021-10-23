const conexao = require('../conexao');

const adicionarUsuarioAoEmprestimo = async (emprestimo) => {
  
  const { rows: usuario } = await conexao.query('select * from usuarios where id = $1', [emprestimo.usuario_id]);
  const { rows: livro } = await conexao.query('select * from livros where id = $1', [emprestimo.livro_id]);

  emprestimo.usuario = usuario[0].nome;
  emprestimo.telefone = usuario[0].telefone;
  emprestimo.emil = usuario[0].email;
  emprestimo.livro = livro[0].nome;

  delete emprestimo.usuario_id;
  delete emprestimo.livro_id;
}

module.exports ={
  adicionarUsuarioAoEmprestimo
}