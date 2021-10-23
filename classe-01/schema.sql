drop table if exists "usuarios";

create table usuarios (
  id serial primary key,
  nome text not null,
  idade int,
  email text not null unique,
  telefone text,
  cpf text not null unique
);

drop table if exists "emprestimos";
create table "emprestimos"(
  id serial primary key,
  usuario_id int not null references usuarios(id),
  livro_id int not null references livros(id),
  status varchar(10) default 'pendente'
);
