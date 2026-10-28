/**
 * CARTILHA DE PROTEÇÃO CONTRA GOLPES NO CELULAR
 * Interações, Exportação PDF, Impressão e Acessibilidade
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos do DOM ---
  const trifoldContainer = document.getElementById('trifoldContainer');
  const digitalContainer = document.getElementById('digitalContainer');
  const btnViewTrifold = document.getElementById('btnViewTrifold');
  const btnViewDigital = document.getElementById('btnViewDigital');
  
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnPrintNative = document.getElementById('btnPrintNative');
  const btnSpeak = document.getElementById('btnSpeak');
  const btnContrast = document.getElementById('btnContrast');
  const btnFontSize = document.getElementById('btnFontSize');

  const printModal = document.getElementById('printModal');
  const closePrintModal = document.getElementById('closePrintModal');
  const confirmPrintBtn = document.getElementById('confirmPrintBtn');

  const pdfProgressModal = document.getElementById('pdfProgressModal');
  const pdfProgressText = document.getElementById('pdfProgressText');

  const printTipBar = document.getElementById('printTipBar');
  const closeTipBtn = document.getElementById('closeTipBtn');

  // --- 1. Alternância de Visualização (Tríptico A4 vs Web Interativa) ---
  function setView(mode) {
    if (mode === 'trifold') {
      trifoldContainer.classList.add('active-view');
      trifoldContainer.style.display = 'flex';
      digitalContainer.classList.remove('active-view');
      digitalContainer.style.display = 'none';

      btnViewTrifold.classList.add('active');
      btnViewDigital.classList.remove('active');
    } else {
      digitalContainer.classList.add('active-view');
      digitalContainer.style.display = 'flex';
      trifoldContainer.classList.remove('active-view');
      trifoldContainer.style.display = 'none';

      btnViewDigital.classList.add('active');
      btnViewTrifold.classList.remove('active');
    }
  }

  btnViewTrifold.addEventListener('click', () => setView('trifold'));
  btnViewDigital.addEventListener('click', () => setView('digital'));

  // --- 2. Barra de Dicas de Impressão ---
  if (closeTipBtn && printTipBar) {
    closeTipBtn.addEventListener('click', () => {
      printTipBar.style.display = 'none';
    });
  }

  // --- 3. Modal de Dicas de Impressão Nativa ---
  function openPrintModal() {
    printModal.style.display = 'flex';
  }

  function closePrintModalHandler() {
    printModal.style.display = 'none';
  }

  if (btnPrintNative) {
    btnPrintNative.addEventListener('click', openPrintModal);
  }

  if (closePrintModal) {
    closePrintModal.addEventListener('click', closePrintModalHandler);
  }

  if (confirmPrintBtn) {
    confirmPrintBtn.addEventListener('click', () => {
      closePrintModalHandler();
      // Garante que o modo tríptico está ativo para impressão ideal
      const prevMode = trifoldContainer.classList.contains('active-view') ? 'trifold' : 'digital';
      setView('trifold');
      setTimeout(() => {
        window.print();
        // Restaura modo anterior se o usuário estava no digital
        if (prevMode === 'digital') {
          setView('digital');
        }
      }, 350);
    });
  }

  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === printModal) {
      closePrintModalHandler();
    }
  });

  // --- 4. Exportação Direta para PDF (html2pdf.js) ---
  btnDownloadPdf.addEventListener('click', async () => {
    // Exibe modal de progresso
    pdfProgressModal.style.display = 'flex';
    pdfProgressText.textContent = 'Preparando páginas em formato A4 Paisagem...';

    // Salva o estado de exibição atual
    const wasDigital = digitalContainer.classList.contains('active-view');
    setView('trifold');

    // Espera a renderização do layout
    await new Promise(resolve => setTimeout(resolve, 400));

    // Elemento a ser renderizado
    const element = document.getElementById('trifoldPrintTarget');

    const opt = {
      margin:       0,
      filename:     'Cartilha_Protecao_Contra_Golpes_A4.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false 
      },
      jsPDF:        { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape' 
      },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    pdfProgressText.textContent = 'Renderizando gráficos e tipografia vetorial...';

    try {
      if (typeof html2pdf !== 'undefined') {
        await html2pdf().set(opt).from(element).save();
        pdfProgressText.textContent = 'Download concluído com sucesso!';
        setTimeout(() => {
          pdfProgressModal.style.display = 'none';
          if (wasDigital) setView('digital');
        }, 1200);
      } else {
        // Fallback caso html2pdf não tenha sido carregado por alguma razão
        pdfProgressModal.style.display = 'none';
        alert('Abrindo diálogo de impressão. Selecione "Salvar como PDF" como impressora.');
        window.print();
        if (wasDigital) setView('digital');
      }
    } catch (err) {
      console.error('Erro na geração do PDF:', err);
      pdfProgressText.textContent = 'Iniciando diálogo do navegador...';
      setTimeout(() => {
        pdfProgressModal.style.display = 'none';
        window.print();
        if (wasDigital) setView('digital');
      }, 1000);
    }
  });

  // --- 5. Leitor de Voz para Acessibilidade (Web Speech API) ---
  let isSpeaking = false;
  let synth = window.speechSynthesis;
  let utterance = null;

  function toggleSpeech() {
    if (!synth) {
      alert('Seu navegador não suporta leitura de voz.');
      return;
    }

    if (isSpeaking) {
      synth.cancel();
      isSpeaking = false;
      btnSpeak.classList.remove('speaking');
      btnSpeak.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        Ouvir Cartilha
      `;
    } else {
      const textToRead = `
        Guia Informativo: Proteção contra golpes no celular.
        Atenção: Nunca tome decisões com pressa! Se sentirem pressa ou pedirem Pix e senhas, pare na hora!
        A Regra de Ouro em 3 Passos:
        Passo 1: PARE! Não aja por impulso nem com pressa. Desligue a chamada imediatamente.
        Passo 2: CONFIRA! Ligue no número antigo do parente ou no verso do seu cartão bancário.
        Passo 3: PEÇA AJUDA! Fale com alguém de sua confiança antes de enviar qualquer dinheiro.
        
        Os 4 Golpes Mais Comuns:
        Primeiro: Falso Parente no WhatsApp. Usam foto de parente dizendo que mudaram de número. Ação: Ligue no número ANTIGO do parente!
        Segundo: Falsa Central do Banco. Dizem que a conta foi invadida e pedem senha ou Pix. Ação: Desligue! O banco NUNCA pede senha.
        Terceiro: Falso INSS ou Prova de Vida. Ameaçam cortar benefício se não clicar em link. Ação: Vá direto à agência ou ao posto oficial.
        Quarto: Prêmios Falsos e Links Azuis. Mensagens com ofertas ou sorteios para clicar. Ação: Nunca toque em links de desconhecidos!
        
        O que o Banco e o INSS NUNCA fazem:
        Nunca pedem senha nem código por ligação.
        Nunca mandam motoqueiro buscar cartão em sua casa.
        Nunca pedem Pix para cancelar compras suspeitas.
        
        O que você deve fazer:
        Desligue na hora se a pessoa demonstrar pressa.
        Ligue no número escrito atrás do seu cartão de crédito ou débito.
        Em caso de dúvida, vá direto ao posto oficial.
        
        Caiu em golpe? O que fazer:
        Mantenha a calma: Não sinta vergonha. A culpa é do golpista!
        Siga esta ordem:
        1. Avise seu banco na hora pelo número do cartão e peça o bloqueio.
        2. Bloqueie o número e corte o contato no WhatsApp imediatamente.
        3. Registre o Boletim de Ocorrência na polícia com alguém de sua confiança.
        4. Avise sua família para ninguém enviar dinheiro.
        Em emergências, ligue Polícia Militar 190 ou Disque Denúncia 181.
      `;

      utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95; // Leitura um pouco mais pausada para clareza

      utterance.onend = () => {
        isSpeaking = false;
        btnSpeak.classList.remove('speaking');
        btnSpeak.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          Ouvir Cartilha
        `;
      };

      synth.speak(utterance);
      isSpeaking = true;
      btnSpeak.classList.add('speaking');
      btnSpeak.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        Pausar Áudio
      `;
    }
  }

  if (btnSpeak) {
    btnSpeak.addEventListener('click', toggleSpeech);
  }

  // --- 6. Tamanho de Fonte (Acessibilidade) ---
  const fontSizes = ['', 'font-large', 'font-xlarge'];
  let currentFontIdx = 0;

  if (btnFontSize) {
    btnFontSize.addEventListener('click', () => {
      document.body.classList.remove(fontSizes[currentFontIdx]);
      currentFontIdx = (currentFontIdx + 1) % fontSizes.length;
      if (fontSizes[currentFontIdx]) {
        document.body.classList.add(fontSizes[currentFontIdx]);
      }
    });
  }

  // --- 7. Alto Contraste ---
  if (btnContrast) {
    btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
    });
  }

  // --- 8. Busca / Filtro em Tempo Real (Modo Digital) ---
  const digitalSearchInput = document.getElementById('digitalSearchInput');
  if (digitalSearchInput) {
    digitalSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.digital-card, .digital-scam-box');

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // --- 9. Simulador Rápido de Segurança ("Estou sob risco?") ---
  const chkUrgency = document.getElementById('chkUrgency');
  const chkPix = document.getElementById('chkPix');
  const chkLink = document.getElementById('chkLink');
  const simResult = document.getElementById('simResult');

  function evaluateSimulator() {
    if (!chkUrgency || !chkPix || !chkLink || !simResult) return;

    const riskCount = (chkUrgency.checked ? 1 : 0) + (chkPix.checked ? 1 : 0) + (chkLink.checked ? 1 : 0);

    if (riskCount > 0) {
      simResult.style.display = 'block';
      simResult.style.background = '#fef2f2';
      simResult.style.color = '#991b1b';
      simResult.style.border = '2px solid #ef4444';
      simResult.innerHTML = `
        🚨 <strong>ALERTA MÁXIMO DE GOLPE!</strong> Você marcou ${riskCount} sinal(is) de perigo. 
        <strong>DESLIGUE A LIGAÇÃO AGORA</strong> e NÃO envie senhas, códigos ou Pix!
      `;
    } else {
      simResult.style.display = 'none';
    }
  }

  [chkUrgency, chkPix, chkLink].forEach(chk => {
    if (chk) chk.addEventListener('change', evaluateSimulator);
  });
});
