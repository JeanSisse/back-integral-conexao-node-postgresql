const conexao = require('../conexao');

const { adicionarUsuarioAoEmprestimo } = require('../auxiliares/adicionarUsuarioAoEmprestimo');

const cadastrarEmprestimo = async (req, res) => {
  const { usuario_id, livro_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json('O campo usuario_id é obrigatório.');
  }

  if (!livro_id) {
    return res.status(400).json('O campo livro_id é obrigatório.');
  }

  try {
    const livro = await conexao.query('select * from livros where id = $1', [livro_id]);
    if (livro.rowCount === 0) {
      return res.status(404).json('O livro informado não foi encontrado.');
    }

    const ususario = await conexao.query('select * from usuarios where id = $1', [usuario_id]);
    if (ususario.rowCount === 0) {
      return res.status(404).json('Usuário informado não foi encontrado.');
    }

    const queryInsert = 'insert into emprestimos (usuario_id, livro_id) values ($1, $2)';
    const livroCadastrado = await conexao.query(queryInsert, [usuario_id, livro_id]);

    if (livroCadastrado.rowCount === 0) {
      return res.status(400).json('Não foi possível cadastrar emprestimo.');
    }

    return res.status(201).json('Emprestimo foi cadastrado com sucesso.');
  } catch (error) {
    res.status(400).json(error.message);
  }
}

const listarEmprestimos = async (req, res) => {
  try {
    const {rows: emprestimos} = await conexao.query('select * from emprestimos');
    
    for (emprestimo of emprestimos) {
      await adicionarUsuarioAoEmprestimo(emprestimo);
    }
    
    return res.status(200).json(emprestimos);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const obterEmprestimo = async (req, res) => {
  const { id } = req.params;

  try {
    const {rowCount, rows: emprestimo} = await conexao.query('select * from emprestimos where id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json('O emprestimo não foi encotrado.');
    }

    await adicionarUsuarioAoEmprestimo(emprestimo[0]);

    return res.status(200).json(emprestimo);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const atualizarEmprestimo = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json('Informar id na url.');
  }

  if (!status) {
    return res.status(400).json('O campo status é obirgatório.');
  }

  try {
   const { rowCount } = await conexao.query('select * from emprestimos where id = $1', [id]);
   
   if (rowCount === 0) {
     return res.status(404).json('Emprestimo não foi encontrado.');
   }

   const queryUpdate = 'update emprestimos set status = $1 where id = $2';
   const emprestimoAtualizado = await conexao.query(queryUpdate, [status, id]);

   if (emprestimoAtualizado.rowCount === 0) {
     return res.status(400).json('Não foi possível atualizar o emprestimo.');
   }

   return res.status(200).json('Emprestimo atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const excluirEmprestimo = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json('Informar id do emprestimo na url');
  }

  try {
    const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

    if (emprestimo.rowCount === 0) {
      return res.status(404).json('O emprestimo não foi encontrado.');
    }

    const emprestimoExcluido = await conexao.query('delete from emprestimos where id = $1', [id]);

    if (emprestimoExcluido.rowCount === 0) {
      return res.status(400).json('Não foi possível excluír o emprestimo.');
    }

    return res.status(200).json('Emprestimo foi excluído com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  cadastrarEmprestimo,
  listarEmprestimos,
  obterEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo
}