// Busca o status da linha 1
fetch('http://localhost:3000/linha1-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 1
        let card = document.getElementById('linha01-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 2
fetch('http://localhost:3000/linha2-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 2
        let card = document.getElementById('linha02-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 3
fetch('http://localhost:3000/linha3-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 3
        let card = document.getElementById('linha03-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 4
fetch('http://localhost:3000/linha4-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 4
        let card = document.getElementById('linha04-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 5
fetch('http://localhost:3000/linha5-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 5
        let card = document.getElementById('linha05-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 7
fetch('http://localhost:3000/linha7-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 7
        let card = document.getElementById('linha07-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 8
fetch('http://localhost:3000/linha8-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 8
        let card = document.getElementById('linha08-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 9
fetch('http://localhost:3000/linha9-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 9
        let card = document.getElementById('linha09-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 10
fetch('http://localhost:3000/linha10-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 10
        let card = document.getElementById('linha10-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 11
fetch('http://localhost:3000/linha11-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 11
        let card = document.getElementById('linha11-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 12
fetch('http://localhost:3000/linha12-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 12
        let card = document.getElementById('linha12-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 13
fetch('http://localhost:3000/linha13-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 13
        let card = document.getElementById('linha13-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

// Busca o status da linha 15
fetch('http://localhost:3000/linha15-status')
    // Converte a resposta para JSON
    .then(response => response.json())
    // Manipula os dados retornados
    .then(data => {
        // Obtém o elemento HTML correspondente ao status da linha 15
        let card = document.getElementById('linha15-info');
        // Define o texto do elemento como o status retornado dos dados
        card.textContent = data.status;

        // Adiciona uma classe CSS com base no status para estilização visual
        switch (data.status) {
            case 'Operação Normal':
                card.classList.add('verde_operacao_normal');
                break;
            case 'Circulação de Trens':
            case 'Operação Parcial':
            case 'Velocidade Reduzida':
            case 'Operação Diferenciada':
                card.classList.add('amarelo_velocidade_reduzida');
                break;
            case 'Dados Indisponíveis':
                card.classList.add('branco_dados_indisponiveis');
                break;
            case 'Paralisada':
            case 'Operação Encerrada':
                card.classList.add('vermelho_paralisada');
                break;
        }

        // Adiciona um evento de mouseover para exibir uma mensagem de tooltip com mais informações
        card.addEventListener('mouseover', () => {
            card.setAttribute('title', data.msg); // Exibe a mensagem como um tooltip ao passar o mouse sobre a linha
        });

    })
    // Captura erros, caso ocorram
    .catch(err => console.log(err));

window.onload = function () {
    // Função para obter a hora e data atual do sistema
    function getHoraAtual() {
        // Cria um objeto Date para obter a hora e data atual
        var data = new Date();
        // Extrai os componentes de data e hora
        var dia = data.getDate();
        var mes = data.getMonth() + 1; // Os meses começam do zero, então somamos 1
        var ano = data.getFullYear();
        var hora = data.getHours();
        var minutos = data.getMinutes();
        // Formata a data no formato DD/MM/AAAA
        var dataFormatada = (dia < 10 ? '0' : '') + dia + '/' + (mes < 10 ? '0' : '') + mes + '/' + ano;
        // Formata a hora no formato HH:MM
        var horaFormatada = (hora < 10 ? '0' : '') + hora + ':' + (minutos < 10 ? '0' : '') + minutos;
        // Retorna a data e hora formatadas como uma string
        return dataFormatada + ' ' + horaFormatada;
    }

    // Atualiza a hora e data atual a cada segundo
    function atualizarHora() {
        var horaAtual = getHoraAtual();
        // Seleciona o elemento com o id "ultima-atualizacao" e atualiza seu conteúdo com a hora e data atual
        document.getElementById('ultima-atualizacao').textContent = 'Atualizado em ' + horaAtual;
    }

    // Função para fazer uma solicitação HTTP GET para a API de notícias
    function fetchNews() {
        const apiKey = '9d1db06d9c1f4b0fb13aaa227b173827';
        const apiUrl = `https://newsapi.org/v2/everything?q=transporte%20p%C3%BAblico%20S%C3%A3o%20Paulo&apiKey=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const newsContainer = document.getElementById('news-container');
                // Limpa o conteúdo anterior
                newsContainer.innerHTML = '';

                // Verifica se os dados retornados pela API estão no formato esperado
                if (data && data.articles) {
                    // Itera sobre os resultados e cria elementos HTML para exibir as notícias
                    data.articles.forEach(newsItem => {
                        const newsElement = document.createElement('div');
                        newsElement.classList.add('news-item');

                        const titleElement = document.createElement('h2');
                        titleElement.textContent = newsItem.title;

                        const descriptionElement = document.createElement('p');
                        descriptionElement.textContent = newsItem.description;

                        const linkElement = document.createElement('a');
                        linkElement.textContent = 'Leia mais';
                        linkElement.href = newsItem.url;
                        linkElement.target = '_blank';

                        const imageElement = document.createElement('img');
                        imageElement.src = newsItem.urlToImage;
                        imageElement.alt = newsItem.title;

                        newsElement.appendChild(titleElement);
                        newsElement.appendChild(descriptionElement);
                        newsElement.appendChild(linkElement);
                        newsElement.appendChild(imageElement);

                        newsContainer.appendChild(newsElement);
                    });
                } else {
                    console.error('Formato de dados inválido ou ausência de dados de notícias.');
                }
            })
            .catch(error => {
                console.error('Erro ao obter notícias:', error);
            });
    }

    // Chama a função atualizarHora quando a página é carregada pela primeira vez
    atualizarHora();

    // Chama a função fetchNews quando a página é carregada
    fetchNews();
};