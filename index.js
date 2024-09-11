const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require('fs').promises;

let mensagem = 'Olá, seja bem-vindo(a) ao sistema de metas!';

let metas;

const carregarMetas = async () => {
    try {
        const metasSalvas = await fs.readFile('metas.json', 'utf-8');
        metas = JSON.parse(metasSalvas);
    } catch (error) {
        metas = [];

        console.log('Nenhuma meta cadastrada.');
    }
}

const salvarMetas = async () => {
    await fs.writeFile('metas.json', JSON.stringify(metas, null, 2));
}

const cadastrarMeta = async () => {
    const meta = await input({
        message: 'Nome da meta:'
    });

    if (meta.length == 0) {
        mensagem = 'Nome da meta inválido.';

        return;
    }

    metas.push({
        value: meta,
        checked: false
    });

    mensagem = 'Meta cadastrada com sucesso!';
}

const listarMetas = async () => {
    if (metas.length == 0) {
        mensagem = 'Nenhuma meta cadastrada.';

        return;
    }

    const respostas = await checkbox({
        message: 'Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa.',
        choices: [...metas],
        instructions: false
    });

    metas.forEach((meta) => {
        meta.checked = false;
    });

    if (respostas.length == 0) {
        mensagem = 'Nenhuma meta selecionada.';

        return;
    }

    respostas.forEach((resposta) => {
        const meta = metas.find((meta) => {
            return meta.value == resposta;
        });

        meta.checked = true;
    });

    mensagem = 'Meta(s) marcada(s) como concluída(s).';
}

const metasRealizadas = async () => {
    if (metas.length == 0) {
        mensagem = 'Nenhuma meta cadastrada.';

        return;
    }

    const realizadas = metas.filter((meta) => {
        return meta.checked;
    });

    if (realizadas.length == 0) {
        mensagem = 'Nenhuma meta realizada.';

        return;
    }

    await select({
        message: 'Metas realizadas (' + realizadas.length + '):',
        choices: [...realizadas]
    });
}

const metasAbertas = async () => {
    if (metas.length == 0) {
        mensagem = 'Nenhuma meta cadastrada.';

        return;
    }

    const abertas = metas.filter((meta) => {
        return !meta.checked;
    });

    if (abertas.length == 0) {
        mensagem = 'Nenhuma meta aberta.';

        return;
    }

    await select({
        message: 'Metas abertas (' + abertas.length + '):',
        choices: [...abertas]
    });
}

const deletarMeta = async () => {
    if (metas.length == 0) {
        mensagem = 'Nenhuma meta cadastrada.';

        return;
    }

    const metasDesmarcadas = metas.map((meta) => {
        return {
            value: meta.value,
            checked: false
        };
    });

    const metasADeletar = await checkbox({
        message: 'Selecione a(s) meta(s) que deseja deletar:',
        choices: [...metasDesmarcadas],
        instructions: false
    });

    if (metasADeletar.length == 0) {
        mensagem = 'Nenhuma meta selecionada.';

        return;
    }

    metasADeletar.forEach((metaADeletar) => {
        metas = metas.filter((meta) => {
            return meta.value != metaADeletar;
        });

        mensagem = 'Meta(s) deletada(s) com sucesso.';
    });
}

const mostrarMensagem = () => {
    console.clear();

    if (mensagem != '') {
        console.log(mensagem);
        console.log('');

        mensagem = '';
    }
}

const start = async () => {
    await carregarMetas();

    while (true) {
        mostrarMensagem();
        await salvarMetas();

        const opcao = await select({
            message: 'Menu >',
            choices: [
                {
                    name: 'Cadastrar meta',
                    value: 'cadastrar'
                },
                {
                    name: 'Listar metas',
                    value: 'listar'
                },
                {
                    name: 'Metas realizadas',
                    value: 'realizadas'
                },
                {
                    name: 'Metas abertas',
                    value: 'abertas'
                },
                {
                    name: 'Deletar meta',
                    value: 'deletar'
                },
                {
                    name: 'Sair',
                    value: 'sair'
                }
            ]
        });

        switch (opcao) {
            case 'cadastrar':
                await cadastrarMeta();
                break;
            case 'listar':
                await listarMetas();
                break;
            case 'realizadas':
                await metasRealizadas();
                break;
            case 'abertas':
                await metasAbertas();
                break;
            case 'deletar':
                await deletarMeta();
                break;
            case 'sair':
                console.log('Até a próxima!');
                return;
            default:
                console.log('Opção inválida.');
                break;
        }
    }
}

start();