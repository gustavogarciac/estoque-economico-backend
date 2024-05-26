# App

Estoque Econômico API.

## RFs (Requisitos Funcionais) // Funcionalidades

- [  ] Deve ser possível cadastrar um usuário.
- [  ] Deve ser possível se autenticar.
- [  ] Deve ser possível atualizar as informações de um usuário.
- [  ] Deve ser possível cadastrar uma organização.
- [  ] Deve ser possível diferenciar cargos dentro de uma organização.
- [  ] Deve ser possível que o administrador convide usuários para uma organização.
- [  ] Uma organização deve poder cadastrar produtos em sistema.
- [  ] Uma organização deve poder categorizar os produtos.
- [  ] Uma organização deve poder receber as métricas dos produtos mais registrados.
- [  ] Uma organização deve poder receber um arquivo csv contendo os dados dos produtos.
- [  ] Deve ser possível deletar registros de produtos
- [  ] Deve ser possível atualizar registros de produtos


## RNs (Regras de Negócio) // Caminhos para atingir certa funcionalidade

- [  ] O usuário não deve poder se cadastrar com e-mail duplicado.
- [  ] Pode-se vincular um usuário a uma empresa durante o cadastro se ela possuir o mesmo domínio da empresa.
- [  ] Não poderá haver duas organizações com o mesmo slug.

## RNFS (Requisitos não-funcionais) // Requisitos técnicos

- [  ] A senha do usuário precisa estar criptografada.
- [  ] Os dados da aplicação precisam estar persistidas em um banco PostgreSQL.
- [  ] Todas listas de dados precisam estar paginadas com 20 itens por página.
- [  ] O usuário deve ser identificado por um JWT (JSON Web Token)