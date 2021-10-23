const conexao = require('../conexao');

const { obterEmprestimosDoUsuario } = require('../auxiliares/obterEmprestimoDoUsuario');

const listarUsuarios = async (req, res) => {
  
  try {
    const { rows: usuarios } = await conexao.query('select * from usuarios');

    for (usuario of usuarios) {
      usuario.emprestimos = await obterEmprestimosDoUsuario(usuario);
    }

    return res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

const obterUsuario = async (req, res) => {
  
  try {
    const { id } = req.params;

    const querySelect = 'select * from usuarios where id = $1';
    const { rowCount, rows } = await conexao.query(querySelect, [id]);

    if (rowCount === 0) {
      return res.status(404).json('Usuário não encontrado');
    }

    const { senha, ...usuario} = rows[0];
    
    usuario.emprestimos = await obterEmprestimosDoUsuario(usuario);
    
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const cadastrarUsuario = async (req, res) => {
  const { nome, idade, email, telefone, cpf } = req.body;

  if (!nome) {
    return res.status(400).json('O campo nome é obrigatorio.');
  }

  if (!email) {
    return res.status(400).json('O campo email é obrigatorio.');
  }

  if (!cpf) {
    return res.status(400).json('O campo cpf é obrigatorio.');
  }

  try {
    const buscarEmail = 'select * from usuarios where email = $1';
    const { rowCount: emailExiste } = await conexao.query(buscarEmail, [email]);

    if (emailExiste !== 0) {
      return res.status(400).json('O e-mail informado já se encontra cadastrado.');
    }

    const buscarCpf = 'select * from usuarios where cpf = $1';
    const { rowCount: cpfExiste } = await conexao.query(buscarCpf, [cpf]);

    if (cpfExiste !== 0) {
      return res.status(400).json('O cpf informado já se encontra cadastrado.');
    }

    const queryInsert = 'insert into usuarios (nome, idade, email, telefone, cpf) values ($1, $2, $3, $4, $5)';
    const { rowCount } = await conexao.query(queryInsert, [nome, idade, email, telefone, cpf]);

    if (rowCount === 0) {
      res.status(400).json('Não foi possível cadastrar o usuário.');
    }

    res.status(201).json('Usuário cadastrado com sucesso.');
  } catch (error) {
    res.status(400).json(error.message);
  }
}

const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, idade, email, telefone, cpf } = req.body;

  try {
    const { rowCount, rows: usuario } = await conexao.query('select * from usuarios where id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json('Usuario não encontrado');
    }

    if (!nome) {
      return res.status(400).json('O campo nome é obrigatório.');
    }

    if (!email) {
      return res.status(400).json('O campo email é obrigatório.');
    }

    if (!cpf) {
      return res.status(400).json('O campo cpf é obrigatório.');
    }

    const buscarCpf= await conexao.query('select * from usuarios where cpf = $1', [cpf]);
    
    if (buscarCpf.rowCount !== 0) {
      if (buscarCpf.rows[0].id !== usuario[0].id) {
        return res.status(400).json('O cpf informado já se encontra cadastrado.');
      }
    }

    const buscarEmail = await conexao.query('select * from usuarios where email = $1', [email]);
    if (buscarEmail.rowCount !== 0) {
      if (buscarEmail.rows[0].id !== usuario[0].id) {
        return res.status(400).json('O email informado já se encontra cadastrado.');
      }
    }

    const telefoneAntigo = telefone ? telefone : usuario[0].telefone;
    const idadeAntigo  = idade ? idade : usuario[0].idade;
    
    const update = 'update usuarios set nome = $1, email = $2, cpf = $3, idade = $4, telefone = $5 where id = $6';
    const {rowCount: atualizado} = await conexao.query(update, [nome, email, cpf, idadeAntigo, telefoneAntigo, usuario[0].id]);

    if (atualizado === 0) {
      return res.status(400).json('Não foi possível atualizar os dados.');
    }

    return res.status(200).json('Dados foi atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const excluirUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

    if (usuario.rowCount === 0) {
      return res.status(404).json('Usuário não foi encontrado.');
    }

    const temEmprestimo = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);

    if (temEmprestimo.rowCount > 0) {
      for (emprestimo of temEmprestimo.rows) {
        if (emprestimo.status === 'pendente') {
          return res.status(400).json('O usuário possui emprestimo pendente.');
        }
      }
    }

    const queryDelete = 'delete from usuario where id = $1';
    const ususarioExcluido = await conexao.query(queryDelete, [usuarios.rows[0].id]);

    if (ususarioExcluido.rowCount === 0) {
      return res.status(400).json('Não foi possível excluir o usuário.');
    }

    return res.status(200).json('Usuário excluído com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  listarUsuarios,
  obterUsuario,
  cadastrarUsuario,
  atualizarUsuario,
  excluirUsuario
}
