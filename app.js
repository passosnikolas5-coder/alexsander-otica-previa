/* ============================================================
   Alexsander Ótica — site-novo · app.js · PARTE 1 de 3
   Escopo DESTE arquivo: aurora canvas, split-text do hero,
   header condensado + progresso, reveal, tilt, magnetismo,
   menu mobile, ano dinâmico.
   FORA de escopo (Partes 2 e 3): coleção, modal, carrinho,
   checkout, toast de compra. Há ganchos comentados abaixo.
   Sem dependências externas. Respeita prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Gancho global (contrato entre as 3 partes) ---------- */
  // A Parte 2 preencherá window.OTICA.produtos com os 6 produtos imutáveis:
  // Aviador Azul (solar, R$80 de R$150, solar-aviador-azul.jpg,-2),
  // Retangular Tartaruga (óptico, R$120, optico-retangular-tartaruga.jpg),
  // Clubmaster Marrom (solar, R$150, solar-clubmaster-marrom.jpg,-2),
  // Redondo Preto (solar, R$140, solar-redondo-preto.jpg,-2),
  // Hexagonal Âmbar (solar, R$130, solar-hexagonal-ambar.jpg,-2,-3),
  // Bali Quadrado (solar, R$150, solar-bali-quadrado.jpg).
  // A Parte 3 usará window.OTICA.atualizarSacola(n) para o contador.
  window.OTICA = window.OTICA || {
    whatsapp: '5521984816082',
    produtos: null, // <-- Parte 2 preenche aqui (array de 6 objetos)
    atualizarSacola: null // <-- Parte 3 preenche aqui (function (n))
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- REFINO A2 · trava de scroll compartilhada (modal/gaveta) ---------- */
  // Contador: modal e gaveta (Parte 2) usam travar/destravar; o scroll só
  // volta quando ambos estiverem fechados, por qualquer caminho.
  window.OTICA._travas = window.OTICA._travas || 0;
  window.OTICA.travarScroll = window.OTICA.travarScroll || function () {
    window.OTICA._travas++;
    document.body.classList.add('travado');
    document.body.style.overflow = 'hidden';
  };
  window.OTICA.destravarScroll = window.OTICA.destravarScroll || function () {
    window.OTICA._travas = Math.max(0, window.OTICA._travas - 1);
    if (window.OTICA._travas === 0) {
      document.body.classList.remove('travado');
      document.body.style.overflow = '';
    }
  };

  /* ---------- 1 · Aurora em canvas (azul-marinho + dourado) ---------- */
  (function aurora() {
    var canvas = document.getElementById('aurora');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 1.5); // teto exigido
    var W = 0, H = 0;
    var PARTS = 70; // ~70 partículas no desktop
    // REFINO A6 · performance: metade das partículas em mobile ou DPR alto
    function definirParts() {
      var mobile = window.innerWidth <= 560;
      var dprAlto = (window.devicePixelRatio || 1) > 2.5;
      PARTS = (mobile || dprAlto) ? 35 : 70;
    }
    definirParts();
    var pontos = [];
    var raf = null;
    var tempo = 0;

    // Paleta da aurora: véus azulados + poeira dourada
    var CORES = [
      { c: '201,168,76', p: 0.34 }, // dourado
      { c: '64,110,180', p: 0.30 }, // azul claro
      { c: '120,150,200', p: 0.22 } // névoa fria
    ];

    function dimensionar() {
      var r = canvas.getBoundingClientRect();
      // Canvas cobre o hero; usa o tamanho real do elemento
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function semear() {
      pontos = [];
      for (var i = 0; i < PARTS; i++) {
        var base = CORES[i % CORES.length];
        pontos.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1 + Math.random() * 2.6,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.18,
          cor: base.c,
          alfa: base.p * (0.5 + Math.random() * 0.5),
          fase: Math.random() * Math.PI * 2,
          vel: 0.4 + Math.random() * 0.8
        });
      }
    }

    function desenharFundo() {
      // Véus diagonais suaves (aurora) — 3 elipses grandes em screen
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      var t = tempo * 0.00012;
      veu(W * (0.72 + 0.04 * Math.sin(t * 2)), H * 0.18, W * 0.42, H * 0.5, '201,168,76', 0.10);
      veu(W * (0.2 + 0.03 * Math.cos(t * 1.6)), H * 0.85, W * 0.38, H * 0.46, '64,110,180', 0.12);
      veu(W * 0.5, H * (0.5 + 0.05 * Math.sin(t)), W * 0.55, H * 0.34, '0,45,98', 0.14);
      ctx.restore();
    }

    function veu(x, y, rx, ry, cor, alfa) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, -0.4, 0, Math.PI * 2);
      var g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      g.addColorStop(0, 'rgba(' + cor + ',' + alfa + ')');
      g.addColorStop(1, 'rgba(' + cor + ',0)');
      ctx.fillStyle = g;
      ctx.fill();
    }

    function quadro(ts) {
      tempo = ts || 0;
      ctx.clearRect(0, 0, W, H);
      desenharFundo();
      for (var i = 0; i < pontos.length; i++) {
        var p = pontos[i];
        p.x += p.vx;
        p.y += p.vy;
        // Deriva de volta para dentro (embrulho suave)
        if (p.x < -8) p.x = W + 8; else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8; else if (p.y > H + 8) p.y = -8;
        var cintila = 0.65 + 0.35 * Math.sin(p.fase + tempo * 0.001 * p.vel);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.cor + ',' + (p.alfa * cintila).toFixed(3) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(quadro);
    }

    dimensionar();
    semear();

    if (reduceMotion) {
      // reduced-motion: um quadro estático, sem loop
      tempo = 1200;
      ctx.clearRect(0, 0, W, H);
      desenharFundo();
      pontos.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.cor + ',' + p.alfa + ')';
        ctx.fill();
      });
    } else {
      raf = requestAnimationFrame(quadro);
    }

    var deb = null;
    window.addEventListener('resize', function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        definirParts();
        dimensionar();
        semear();
        if (reduceMotion) {
          ctx.clearRect(0, 0, W, H);
          desenharFundo();
          pontos.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + p.cor + ',' + p.alfa + ')';
            ctx.fill();
          });
        }
      }, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (reduceMotion) return;
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
      else if (!document.hidden && !raf) { raf = requestAnimationFrame(quadro); }
    });
  })();

  /* ---------- 2 · Split-text do hero (por palavra) ---------- */
  (function splitHero() {
    var h1 = document.getElementById('hero-titulo');
    if (!h1 || h1.dataset.splitFeito) return;
    var linhas = h1.querySelectorAll('.linha');
    if (!linhas.length) return;
    var indice = 0;

    linhas.forEach(function (linha) {
      var palavras = linha.textContent.trim().split(/\s+/);
      linha.textContent = '';
      palavras.forEach(function (palavra, i) {
        var inv = document.createElement('span');
        inv.className = 'palavra';
        var dentro = document.createElement('span');
        dentro.textContent = palavra;
        // Stagger de 70ms por palavra — ritmo de leitura
        dentro.style.setProperty('--atraso', (indice * 0.07).toFixed(2) + 's');
        inv.appendChild(dentro);
        linha.appendChild(inv);
        if (i < palavras.length - 1) linha.appendChild(document.createTextNode(' '));
        indice++;
      });
    });

    h1.dataset.splitFeito = 'true';
    // Força reflow para a animação CSS disparar de forma consistente
    void h1.offsetWidth;
    h1.classList.add('pronto');
  })();

  /* ---------- 3 · Header que condensa + barra de progresso ---------- */
  (function headerProgresso() {
    var header = document.getElementById('site-header');
    var barra = document.getElementById('progresso');
    if (!header && !barra) return;
    var agendado = false;

    function atualizar() {
      agendado = false;
      var rolagem = window.scrollY || document.documentElement.scrollTop || 0;
      if (header) header.classList.toggle('site-header--condensado', rolagem > 24);
      if (barra) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        barra.style.width = (max > 0 ? (rolagem / max) * 100 : 0) + '%';
      }
    }

    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; requestAnimationFrame(atualizar); }
    }, { passive: true });
    atualizar();
  })();

  /* ---------- REFINO A1 · Scrollspy (observer próprio, sem brigar com reveal) ---------- */
  (function scrollspy() {
    var nav = document.getElementById('nav-principal');
    if (!nav || !('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;
    function limpar() {
      links.forEach(function (a) { a.classList.remove('ativo'); a.removeAttribute('aria-current'); });
    }
    function ativar(id) {
      var achou = false;
      links.forEach(function (a) {
        var alvo = a.getAttribute('href');
        if (alvo === '#' + id) {
          a.classList.add('ativo');
          a.setAttribute('aria-current', 'true');
          achou = true;
        } else {
          a.classList.remove('ativo');
          a.removeAttribute('aria-current');
        }
      });
      return achou;
    }
    // Seções podem ser montadas depois (Partes 2/3): re-coleta sob demanda.
    var ioSpy = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) ativar(e.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    function observar() {
      links.forEach(function (a) {
        var id = (a.getAttribute('href') || '').slice(1);
        if (!id) return;
        var sec = document.getElementById(id);
        if (sec && !sec.dataset.spyObs) { sec.dataset.spyObs = 'true'; ioSpy.observe(sec); }
      });
      // #topo (hero) também participa
      var topo = document.getElementById('topo');
      if (topo && !topo.dataset.spyObs) { topo.dataset.spyObs = 'true'; ioSpy.observe(topo); }
    }
    observar();
    // Re-tenta após montagem assíncrona das Partes 2/3
    var tentativas = 0;
    var timer = setInterval(function () {
      observar();
      if (++tentativas >= 10) clearInterval(timer);
    }, 800);
    void limpar;
  })();

  /* ---------- REFINO A4 · Voltar ao topo (dourado, após 600px) ---------- */
  (function voltarTopo() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voltar-topo';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.textContent = '↑';
    btn.hidden = false;
    document.body.appendChild(btn);
    var agendado = false;
    function atualizar() {
      agendado = false;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.classList.toggle('visivel', y > 600);
    }
    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; requestAnimationFrame(atualizar); }
    }, { passive: true });
    btn.addEventListener('click', function () {
      if (reduceMotion) window.scrollTo(0, 0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      // Devolve o foco ao conteúdo para leitores de tela
      var topo = document.getElementById('topo');
      if (topo) { topo.setAttribute('tabindex', '-1'); topo.focus({ preventScroll: true }); }
    });
    atualizar();
  })();

  /* ---------- 4 · Reveal on scroll (IntersectionObserver) ---------- */
  (function reveal() {
    var alvos = document.querySelectorAll('.reveal');
    if (!alvos.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      // Sem observer ou com movimento reduzido: mostra tudo
      alvos.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 5 · Tilt 3D do card + magnetismo dos botões ---------- */
  (function tiltMagnetismo() {
    if (!pointerFino || reduceMotion) return;

    document.querySelectorAll('[data-tilt]').forEach(function (cartao) {
      cartao.addEventListener('mousemove', function (ev) {
        var r = cartao.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        cartao.style.transform =
          'perspective(1000px) rotateX(' + (-py * 8).toFixed(2) + 'deg)' +
          ' rotateY(' + (px * 10).toFixed(2) + 'deg) translateY(-4px)';
      });
      cartao.addEventListener('mouseleave', function () {
        cartao.style.transform = '';
      });
    });

    document.querySelectorAll('.btn--magnetico').forEach(function (btn) {
      btn.addEventListener('mousemove', function (ev) {
        var r = btn.getBoundingClientRect();
        var dx = (ev.clientX - r.left - r.width / 2) * 0.15;
        var dy = (ev.clientY - r.top - r.height / 2) * 0.2;
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  /* ---------- 6 · Menu mobile ---------- */
  (function menuMobile() {
    var btn = document.getElementById('menu-btn');
    var nav = document.getElementById('nav-principal');
    if (!btn || !nav) return;

    function fechar() {
      nav.classList.remove('aberto');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menu');
    }

    btn.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) fechar();
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && nav.classList.contains('aberto')) {
        fechar();
        btn.focus();
      }
    });

    // Se a viewport voltar ao desktop, garante nav visível sem estado preso
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) fechar();
    }, { passive: true });
  })();

  /* ---------- 7 · Ano dinâmico + contador da sacola (gancho) ---------- */
  (function rodapeSacola() {
    var ano = document.getElementById('ano');
    if (ano) ano.textContent = String(new Date().getFullYear());

    // Contador fica em 0 na Parte 1. A Parte 3 assume via:
    //   window.OTICA.atualizarSacola = function (n) { … }
    // Deixamos um setter provisório para o outro especialista plugar.
    var num = document.getElementById('cart-num');
    if (num && typeof window.OTICA.atualizarSacola !== 'function') {
      window.OTICA.atualizarSacola = function (n) {
        num.textContent = String(Math.max(0, parseInt(n, 10) || 0));
      };
    }

    var abrir = document.getElementById('cart-abrir');
    if (abrir && !abrir.dataset.parte1) {
      abrir.dataset.parte1 = 'true';
      abrir.addEventListener('click', function () {
        // Sem gaveta na Parte 1: leva ao WhatsApp em vez de falhar em silêncio.
        // A Parte 2 expõe window.OTICA.abrirSacola (gaveta real) — este gancho
        // delega automaticamente quando ela existir.
        if (typeof window.OTICA.abrirSacola === 'function') {
          window.OTICA.abrirSacola();
        } else {
          window.open(
            'https://wa.me/5521984816082?text=' +
              encodeURIComponent('Olá Alexsander Ótica, quero montar minha sacola'),
            '_blank', 'noopener'
          );
        }
      });
    }
  })();
})();

/* ============================================================
   PARTE 2 — coleção/modal/sacola (JS puro, sem dependências)
   Monta <section id="colecao"> dentro de #app-colecao; preenche
   window.OTICA.produtos (6 itens imutáveis); gaveta persiste em
   localStorage; expõe atualizarSacola/abrirSacola; reaproveita o
   padrão .reveal da Parte 1 com observer próprio para os cards.
   Parte 3: #lentes #avaliacoes #loja #contato + rodapé completo.
   ============================================================ */
(function () {
  'use strict';

  var WHATS = (window.OTICA && window.OTICA.whatsapp) || '5521984816082';
  var CUPOM = 'BEMVINDO10';
  var DESCONTO = 0.10;
  var CHAVE_SACOLA = 'alexsander-otica-sacola-v1';

  var LENTES = ['Transparente', 'Antirreflexo', 'Fotossensível', 'Polarizada'];

  /* ---------- Dados imutáveis (iguais ao original) ---------- */
  var PRODUTOS = [
    {
      id: 'aviador-azul',
      nome: 'Aviador Azul',
      tipo: 'solar',
      tipoRotulo: 'Solar',
      formato: 'Aviador',
      preco: 80,
      precoAntigo: 150,
      tag: 'PROMOÇÃO',
      fotos: ['./fotos/solar-aviador-azul.jpg', './fotos/solar-aviador-azul-2.jpg'],
      cores: ['Dourado e azul', 'Preto', 'Prata', 'Marrom'],
      descricao: 'O clássico aviador com armação dourada e lente azul. O mais pedido da loja.'
    },
    {
      id: 'retangular-tartaruga',
      nome: 'Retangular Tartaruga',
      tipo: 'optico',
      tipoRotulo: 'Óptico',
      formato: 'Retangular',
      preco: 120,
      precoAntigo: null,
      tag: null,
      fotos: ['./fotos/optico-retangular-tartaruga.jpg'],
      cores: ['Tartaruga', 'Preto', 'Marrom', 'Azul'],
      descricao: 'Retangular Tartaruga óptico: presença discreta para o dia a dia e o trabalho.'
    },
    {
      id: 'clubmaster-marrom',
      nome: 'Clubmaster Marrom',
      tipo: 'solar',
      tipoRotulo: 'Solar',
      formato: 'Clubmaster',
      preco: 150,
      precoAntigo: null,
      tag: null,
      fotos: ['./fotos/solar-clubmaster-marrom.jpg', './fotos/solar-clubmaster-marrom-2.jpg'],
      cores: ['Marrom', 'Preto', 'Tartaruga'],
      descricao: 'Clubmaster Marrom solar: meio-aro atemporal com atitude retrô.'
    },
    {
      id: 'redondo-preto',
      nome: 'Redondo Preto',
      tipo: 'solar',
      tipoRotulo: 'Solar',
      formato: 'Redondo',
      preco: 140,
      precoAntigo: null,
      tag: null,
      fotos: ['./fotos/solar-redondo-preto.jpg', './fotos/solar-redondo-preto-2.jpg'],
      cores: ['Preto', 'Grafite', 'Dourado'],
      descricao: 'Redondo Preto solar: leve, criativo e fácil de combinar.'
    },
    {
      id: 'hexagonal-ambar',
      nome: 'Hexagonal Âmbar',
      tipo: 'solar',
      tipoRotulo: 'Solar',
      formato: 'Hexagonal',
      preco: 130,
      precoAntigo: null,
      tag: 'NOVO',
      fotos: ['./fotos/solar-hexagonal-ambar.jpg', './fotos/solar-hexagonal-ambar-2.jpg', './fotos/solar-hexagonal-ambar-3.jpg'],
      cores: ['Âmbar', 'Preto', 'Verde'],
      descricao: 'Hexagonal Âmbar solar: geométrico, autoral e cheio de personalidade.'
    },
    {
      id: 'bali-quadrado',
      nome: 'Bali Quadrado',
      tipo: 'solar',
      tipoRotulo: 'Solar',
      formato: 'Quadrado',
      preco: 150,
      precoAntigo: null,
      tag: 'NOVO',
      fotos: ['./fotos/solar-bali-quadrado.jpg'],
      cores: ['Preto', 'Tartaruga', 'Branco'],
      descricao: 'Bali Quadrado solar: marcante na medida, do casual ao arrumado.'
    }
  ];

  window.OTICA = window.OTICA || {};
  window.OTICA.produtos = PRODUTOS;
  window.OTICA.lentes = LENTES;
  window.OTICA.cupom = CUPOM;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  function moeda(v) { return fmt.format(v); }
  /* EV4 · preço funcional: "R$" menor + valor em Fraunces 800 (via CSS).
     Mesmos números de moeda(); só muda o markup para baseline e selo. */
  function numeroBR(v) { return Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }); }
  function precoRico(v) { return '<span class="vp-cifrao">R$</span> <span class="vp-valor">' + numeroBR(v) + '</span>'; }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function porId(id) {
    for (var i = 0; i < PRODUTOS.length; i++) if (PRODUTOS[i].id === id) return PRODUTOS[i];
    return null;
  }
  function escapar(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Cor → fundo do swatch (só visual; nomes imutáveis acima) */
  var COR_FUNDO = {
    'Dourado e azul': 'linear-gradient(135deg,#C9A84C 50%,#1e4fa3 50%)',
    'Dourado': 'linear-gradient(135deg,#E4D199,#A88A35)',
    'Preto': '#1b1e24',
    'Prata': 'linear-gradient(135deg,#e8e8e8,#a9a9a9)',
    'Marrom': '#6b4226',
    'Tartaruga': 'linear-gradient(135deg,#8a5a2b 30%,#3a2410 55%,#d99a2b 85%)',
    'Azul': '#1e4fa3',
    'Grafite': '#3a3f44',
    'Âmbar': 'linear-gradient(135deg,#e8b23a,#8a5a1a)',
    'Verde': '#2e6b34',
    'Branco': '#f5f5f0'
  };
  function fundoCor(c) { return COR_FUNDO[c] || '#c9c9c9'; }

  function msgOrcamento(p, cor) {
    return 'Olá Alexsander Ótica, quero orçamento do ' + p.nome +
      ' (' + p.formato + ' · ' + cor + ' · ' + p.tipoRotulo + ') — ' + moeda(p.preco);
  }
  function linkZap(texto) {
    return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(texto);
  }

  /* ---------- Estado dos filtros ---------- */
  var filtros = { tab: 'todos', busca: '', formato: 'todos', ordem: 'destaques' };
  var corSel = {}; // id -> cor selecionada no card
  PRODUTOS.forEach(function (p) { corSel[p.id] = p.cores[0]; });

  var montagem = document.getElementById('app-colecao');
  if (!montagem) return;

  /* ---------- Reveal próprio p/ cards (mesmo padrão da Parte 1) ---------- */
  var ioCards = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    ioCards = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); ioCards.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  function observarReveals(escopo) {
    var alvos = escopo.querySelectorAll('.reveal:not(.visible)');
    if (!ioCards) { alvos.forEach(function (el) { el.classList.add('visible'); }); return; }
    alvos.forEach(function (el) { ioCards.observe(el); });
  }

  /* ---------- Tilt 3D sutil dos cards ---------- */
  function aplicarTilt(cartao) {
    if (!pointerFino || reduceMotion) return;
    cartao.addEventListener('mousemove', function (ev) {
      var r = cartao.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      cartao.style.transform =
        'perspective(1000px) rotateX(' + (-py * 5).toFixed(2) + 'deg)' +
        ' rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-6px)';
    });
    cartao.addEventListener('mouseleave', function () { cartao.style.transform = ''; });
  }

  /* ---------- Monta a seção ---------- */
  var formatos = ['Aviador', 'Retangular', 'Clubmaster', 'Redondo', 'Hexagonal', 'Quadrado'];

  montagem.innerHTML =
    '<section id="colecao" class="secao secao--clara" aria-labelledby="colecao-titulo">' +
      '<div class="container">' +
        '<div class="colecao-head">' +
          '<div>' +
            '<p class="eyebrow reveal">Escolha seu próximo par</p>' +
            '<h2 class="colecao-titulo reveal" id="colecao-titulo" style="--d:.08s">A coleção, <em>peça por peça.</em></h2>' +
            '<p class="colecao-lead reveal" style="--d:.16s">Seis modelos que a loja mais vende: prove pelo estilo, escolha a cor e chame no WhatsApp ou monte sua sacola.</p>' +
          '</div>' +
          '<p class="colecao-contador reveal" style="--d:.22s" aria-live="polite"><strong id="p2-num">6</strong><span id="p2-num-rotulo">6 modelos</span></p>' +
        '</div>' +
        '<div class="colecao-bar reveal" style="--d:.28s">' +
          '<div class="colecao-tabs" role="group" aria-label="Filtrar por tipo">' +
            '<button class="colecao-tab" type="button" data-tab="todos" aria-pressed="true">Todos</button>' +
            '<button class="colecao-tab" type="button" data-tab="solar" aria-pressed="false">Solar</button>' +
            '<button class="colecao-tab" type="button" data-tab="optico" aria-pressed="false">Óptico</button>' +
          '</div>' +
          '<div class="colecao-ferramentas">' +
            '<div class="colecao-busca">' +
              '<span class="lupa" aria-hidden="true">⌕</span>' +
              '<label class="p2-sr" for="p2-busca">Buscar modelo, formato ou cor</label>' +
              '<input id="p2-busca" type="search" placeholder="Buscar modelo, formato ou cor…" autocomplete="off" />' +
            '</div>' +
            '<label class="p2-sr" for="p2-formato">Filtrar por formato</label>' +
            '<select class="colecao-select" id="p2-formato">' +
              '<option value="todos">Todos os formatos</option>' +
              formatos.map(function (f) { return '<option value="' + f + '">' + f + '</option>'; }).join('') +
            '</select>' +
            '<label class="p2-sr" for="p2-ordem">Ordenar</label>' +
            '<select class="colecao-select" id="p2-ordem">' +
              '<option value="destaques">Ordenar: destaques</option>' +
              '<option value="menor">Menor preço</option>' +
              '<option value="maior">Maior preço</option>' +
              '<option value="az">Nome (A–Z)</option>' +
            '</select>' +
            '<button class="colecao-limpar" id="p2-limpar" type="button" disabled>Limpar filtros ✕</button>' +
          '</div>' +
          '<p class="colecao-status" id="p2-status" aria-live="polite"></p>' +
        '</div>' +
        '<ul class="colecao-grade" id="p2-grade" aria-live="polite" aria-label="Modelos disponíveis"></ul>' +
        '<div class="colecao-vazio" id="p2-vazio" hidden>' +
          '<span class="oculos" aria-hidden="true">👓</span>' +
          '<h3>Nenhum modelo encontrado</h3>' +
          '<p>Ajuste a busca ou os filtros — ou fale com a loja que a gente acha seu par ideal.</p>' +
          '<button class="btn btn--solido" id="p2-vazio-limpar" type="button">Limpar filtros</button>' +
        '</div>' +
      '</div>' +
    '</section>';

  var grade = montagem.querySelector('#p2-grade');
  var vazio = montagem.querySelector('#p2-vazio');
  var elNum = montagem.querySelector('#p2-num');
  var elNumRotulo = montagem.querySelector('#p2-num-rotulo');
  var elStatus = montagem.querySelector('#p2-status');
  var elBusca = montagem.querySelector('#p2-busca');
  var elFormato = montagem.querySelector('#p2-formato');
  var elOrdem = montagem.querySelector('#p2-ordem');
  var elLimpar = montagem.querySelector('#p2-limpar');

  function listaFiltrada() {
    var b = norm(filtros.busca.trim());
    var lista = PRODUTOS.filter(function (p) {
      if (filtros.tab !== 'todos' && p.tipo !== filtros.tab) return false;
      if (filtros.formato !== 'todos' && p.formato !== filtros.formato) return false;
      if (b) {
        var alvo = norm(p.nome + ' ' + p.formato + ' ' + p.tipoRotulo + ' ' + p.cores.join(' '));
        if (alvo.indexOf(b) === -1) return false;
      }
      return true;
    });
    if (filtros.ordem === 'menor') lista.sort(function (a, c) { return a.preco - c.preco; });
    else if (filtros.ordem === 'maior') lista.sort(function (a, c) { return c.preco - a.preco; });
    else if (filtros.ordem === 'az') lista.sort(function (a, c) { return a.nome.localeCompare(c.nome, 'pt-BR'); });
    return lista;
  }

  function cartaoHTML(p, i) {
    var cor = corSel[p.id];
    var preco = '<strong>' + precoRico(p.preco) + '</strong>';
    if (p.precoAntigo) {
      var eco = Math.round((1 - p.preco / p.precoAntigo) * 100);
      preco = '<s>' + moeda(p.precoAntigo) + '</s>' + preco + '<span class="economia">−' + eco + '%</span>';
    }
    var tag = p.tag
      ? '<span class="card-tag' + (p.tag === 'NOVO' ? ' card-tag--novo' : '') + '">' + p.tag + '</span>'
      : '';
    // R4 · linha informativa sob o preço, 100% derivada dos dados reais
    var infoLinha = p.cores.length + (p.cores.length === 1 ? ' cor' : ' cores') + ' · ' + p.tipoRotulo;
    var sws = p.cores.map(function (c, k) {
      return '<button class="swatch" type="button" data-cor="' + escapar(c) + '" ' +
        'style="background:' + fundoCor(c) + '" title="' + escapar(c) + '" ' +
        'aria-label="Cor ' + escapar(c) + ' para ' + escapar(p.nome) + '" ' +
        'aria-pressed="' + (c === cor ? 'true' : 'false') + '"></button>';
    }).join('');
    return '<li>' +
      '<article class="card reveal' + (p.fotos.length > 1 ? ' card--dupla' : '') + '" style="--d:' + (i * 0.07).toFixed(2) + 's" data-card="' + p.id + '">' +
        '<div class="card-midia">' +
          '<img class="card-foto--base" src="' + p.fotos[0] + '" alt="' + escapar(p.nome + ' ' + p.tipoRotulo + ' — ' + p.formato) + '" loading="lazy" decoding="async" width="880" height="660" />' +
          (p.fotos.length > 1 ? '<img class="card-foto--alt" src="' + p.fotos[1] + '" alt="" aria-hidden="true" loading="lazy" decoding="async" width="880" height="660" />' : '') +
          tag +
        '</div>' +
        '<div class="card-corpo">' +
          '<h3 class="card-nome">' + escapar(p.nome) + '</h3>' +
          '<p class="card-meta">' + escapar(p.tipoRotulo) + ' · ' + escapar(p.formato) + ' · <strong data-cor-nome>' + escapar(cor) + '</strong></p>' +
          '<p class="card-preco">' + preco + '</p>' +
          '<p class="card-info-linha">' + escapar(infoLinha) + '</p>' +
          '<div class="swatches" role="group" aria-label="Cores do ' + escapar(p.nome) + '">' + sws + '</div>' +
          '<div class="card-acoes">' +
            '<button class="btn btn--solido btn--pequeno" type="button" data-escolher aria-label="Escolher ' + escapar(p.nome) + ' e ver detalhes">Escolher</button>' +
            '<a class="card-orcamento" data-orcamento target="_blank" rel="noopener" href="' + linkZap(msgOrcamento(p, cor)) + '">Orçamento ↗</a>' +
          '</div>' +
        '</div>' +
      '</article>' +
    '</li>';
  }

  function renderGrade() {
    var lista = listaFiltrada();
    grade.innerHTML = lista.map(cartaoHTML).join('');
    // REFINO B7 · re-anima em stagger: --d por índice nos visíveis
    grade.querySelectorAll('.card.reveal').forEach(function (card, i) {
      card.classList.remove('visible');
      card.style.setProperty('--d', (i * 0.07).toFixed(2) + 's');
    });
    // Força reflow para a transição CSS re-disparar
    void grade.offsetWidth;
    var n = lista.length;
    elNum.textContent = String(n);
    elNumRotulo.textContent = n === 1 ? '1 modelo' : n + ' modelos';
    vazio.hidden = n !== 0;
    grade.hidden = n === 0;
    var partes = [];
    if (filtros.tab !== 'todos') partes.push(filtros.tab === 'solar' ? 'solares' : 'ópticos');
    if (filtros.formato !== 'todos') partes.push('formato ' + filtros.formato);
    if (filtros.busca.trim()) partes.push('busca “' + filtros.busca.trim() + '”');
    elStatus.textContent = n === 0
      ? 'Sem resultados para os filtros atuais.'
      : n === 6 && !partes.length
        ? 'Mostrando toda a coleção.'
        : 'Mostrando ' + n + ' de 6 modelos' + (partes.length ? ' — ' + partes.join(' · ') : '') + '.';
    var sujo = filtros.tab !== 'todos' || filtros.formato !== 'todos' || filtros.busca.trim() !== '' || filtros.ordem !== 'destaques';
    elLimpar.disabled = !sujo;

    grade.querySelectorAll('[data-card]').forEach(function (card) {
      aplicarTilt(card);
      var p = porId(card.getAttribute('data-card'));
      card.querySelectorAll('.swatch').forEach(function (btn) {
        btn.addEventListener('click', function () {
          corSel[p.id] = btn.getAttribute('data-cor');
          card.querySelectorAll('.swatch').forEach(function (s) {
            s.setAttribute('aria-pressed', s === btn ? 'true' : 'false');
          });
          card.querySelector('[data-cor-nome]').textContent = corSel[p.id];
          var a = card.querySelector('[data-orcamento]');
          a.href = linkZap(msgOrcamento(p, corSel[p.id]));
        });
      });
      card.querySelector('[data-escolher]').addEventListener('click', function () {
        abrirModal(p.id, card.querySelector('[data-escolher]'));
      });
    });
    observarReveals(montagem);
  }

  function limparFiltros() {
    filtros = { tab: 'todos', busca: '', formato: 'todos', ordem: 'destaques' };
    montagem.querySelectorAll('.colecao-tab').forEach(function (t) {
      t.setAttribute('aria-pressed', t.getAttribute('data-tab') === 'todos' ? 'true' : 'false');
    });
    elBusca.value = '';
    elFormato.value = 'todos';
    elOrdem.value = 'destaques';
    renderGrade();
    elBusca.focus();
  }

  montagem.querySelectorAll('.colecao-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      filtros.tab = t.getAttribute('data-tab');
      montagem.querySelectorAll('.colecao-tab').forEach(function (x) {
        x.setAttribute('aria-pressed', x === t ? 'true' : 'false');
      });
      renderGrade();
    });
  });
  var debBusca = null;
  elBusca.addEventListener('input', function () {
    clearTimeout(debBusca);
    debBusca = setTimeout(function () { filtros.busca = elBusca.value; renderGrade(); }, 140);
  });
  elFormato.addEventListener('change', function () { filtros.formato = elFormato.value; renderGrade(); });
  elOrdem.addEventListener('change', function () { filtros.ordem = elOrdem.value; renderGrade(); });
  elLimpar.addEventListener('click', limparFiltros);
  montagem.querySelector('#p2-vazio-limpar').addEventListener('click', limparFiltros);

  /* ---------- Modal de detalhes ---------- */
  var veuModal = document.createElement('div');
  veuModal.className = 'modal-veu';
  veuModal.hidden = true;
  veuModal.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="p2-modal-titulo">' +
      '<button class="modal-fechar" type="button" data-fechar aria-label="Fechar detalhes">✕</button>' +
      '<ol class="modal-passos" id="p2-passos" aria-label="Etapas: modelo, lente e sacola">' +
        '<li data-passo="1"><span class="passo-n" aria-hidden="true">1</span><span>Modelo</span></li>' +
        '<li class="passo-sep" aria-hidden="true">·</li>' +
        '<li data-passo="2"><span class="passo-n" aria-hidden="true">2</span><span>Lente</span></li>' +
        '<li class="passo-sep" aria-hidden="true">·</li>' +
        '<li data-passo="3"><span class="passo-n" aria-hidden="true">3</span><span>Sacola</span></li>' +
      '</ol>' +
      '<div class="modal-grade">' +
        '<div class="modal-galeria">' +
          '<div class="modal-foto"><img id="p2-m-foto" src="" alt="" /></div>' +
          '<div class="modal-thumbs" id="p2-m-thumbs" role="group" aria-label="Fotos do modelo"></div>' +
        '</div>' +
        '<div class="modal-info">' +
          '<div><p class="eyebrow" id="p2-m-eyebrow"></p><h3 id="p2-modal-titulo"></h3>' +
          '<p class="modal-desc" id="p2-m-desc"></p></div>' +
          '<p class="modal-preco" id="p2-m-preco"></p>' +
          '<div><p class="opcao-titulo">Cor — <span class="valor" id="p2-m-cor-nome"></span></p><div class="pills" id="p2-m-cores" role="group" aria-label="Escolher cor"></div></div>' +
          '<div><p class="opcao-titulo">Lente</p><div class="pills" id="p2-m-lentes" role="group" aria-label="Escolher lente"></div></div>' +
          '<div class="modal-linha">' +
            '<div><p class="opcao-titulo">Quantidade</p><div class="qtd">' +
              '<button type="button" id="p2-m-menos" aria-label="Diminuir quantidade">−</button>' +
              '<output id="p2-m-qtd" aria-live="polite">1</output>' +
              '<button type="button" id="p2-m-mais" aria-label="Aumentar quantidade">+</button>' +
            '</div></div>' +
            '<div><p class="opcao-titulo"><label for="p2-m-cupom">Cupom</label></p><div class="cupom">' +
              '<input id="p2-m-cupom" placeholder="BEMVINDO10" autocomplete="off" spellcheck="false" />' +
              '<button type="button" id="p2-m-cupom-btn">Aplicar</button>' +
            '</div></div>' +
          '</div>' +
          '<p class="cupom-msg" id="p2-m-cupom-msg" aria-live="polite"></p>' +
          '<div class="modal-total"><div><small>Total</small><span class="desconto" id="p2-m-desconto" hidden></span></div><strong id="p2-m-total"></strong></div>' +
          '<div class="modal-acoes">' +
            '<button class="btn btn--solido" type="button" id="p2-m-add">Adicionar à sacola</button>' +
            '<a class="modal-zap" id="p2-m-zap" target="_blank" rel="noopener" href="#">Pedir no WhatsApp ↗</a>' +
          '</div>' +
          '<p class="modal-nota">Pix ou cartão · Retirada na loja em Mesquita · Cupom BEMVINDO10 dá 10% off.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(veuModal);

  var m = { id: null, foto: 0, cor: null, lente: 'Polarizada', lenteOk: false, qtd: 1, cupom: '', origem: null };

  function cupomValido(v) { return norm(v).replace(/\s+/g, '') === norm(CUPOM); }
  function totalModal() {
    var p = porId(m.id);
    var bruto = p.preco * m.qtd;
    return cupomValido(m.cupom) ? Math.round(bruto * (1 - DESCONTO)) : bruto;
  }

  function renderModal() {
    var p = porId(m.id);
    if (!p) return;
    veuModal.querySelector('#p2-m-eyebrow').textContent = p.tipoRotulo + ' · ' + p.formato;
    veuModal.querySelector('#p2-modal-titulo').textContent = p.nome;
    veuModal.querySelector('#p2-m-desc').textContent = p.descricao;
    veuModal.querySelector('#p2-m-preco').innerHTML =
      (p.precoAntigo ? '<s>' + moeda(p.precoAntigo) + '</s>' : '') + '<strong>' + precoRico(p.preco) + '</strong>' +
      (p.precoAntigo ? '<span class="economia">−' + Math.round((1 - p.preco / p.precoAntigo) * 100) + '%</span>' : '');
    var foto = veuModal.querySelector('#p2-m-foto');
    // REFINO B8 · skeleton shimmer enquanto a foto principal carrega
    var moldura = veuModal.querySelector('.modal-foto');
    if (moldura) moldura.classList.add('carregando');
    foto.onload = function () { if (moldura) moldura.classList.remove('carregando'); };
    foto.decoding = 'async';
    foto.src = p.fotos[m.foto];
    foto.alt = p.nome + ' ' + p.tipoRotulo + ' — foto ' + (m.foto + 1) + ' de ' + p.fotos.length;
    // R4 · anuncia "Foto N de M" para leitor de tela / galeria por teclado
    foto.setAttribute('aria-label', 'Foto ' + (m.foto + 1) + ' de ' + p.fotos.length);
    // Se a imagem já estava em cache, remove o skeleton na hora
    if (foto.complete && foto.naturalWidth > 0 && moldura) moldura.classList.remove('carregando');

    var th = veuModal.querySelector('#p2-m-thumbs');
    th.innerHTML = '';
    p.fotos.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'modal-thumb carregando';
      b.setAttribute('aria-pressed', i === m.foto ? 'true' : 'false');
      b.setAttribute('aria-label', 'Ver foto ' + (i + 1) + ' de ' + p.nome);
      var img = document.createElement('img');
      img.src = f;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onload = (function (botao) {
        return function () { botao.classList.remove('carregando'); };
      })(b);
      if (img.complete && img.naturalWidth > 0) b.classList.remove('carregando');
      b.appendChild(img);
      b.addEventListener('click', function () { m.foto = i; renderModal(); });
      th.appendChild(b);
    });

    veuModal.querySelector('#p2-m-cor-nome').textContent = m.cor;
    var gc = veuModal.querySelector('#p2-m-cores');
    gc.innerHTML = '';
    p.cores.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.textContent = c;
      b.setAttribute('aria-pressed', c === m.cor ? 'true' : 'false');
      b.addEventListener('click', function () { m.cor = c; renderModal(); });
      gc.appendChild(b);
    });

    var gl = veuModal.querySelector('#p2-m-lentes');
    gl.innerHTML = '';
    LENTES.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.textContent = l;
      b.setAttribute('aria-pressed', l === m.lente ? 'true' : 'false');
      b.addEventListener('click', function () { m.lente = l; m.lenteOk = true; renderModal(); });
      gl.appendChild(b);
    });

    veuModal.querySelector('#p2-m-qtd').textContent = String(m.qtd);
    // REFINO B10 · limite visual do stepper (− no 1, + no 9)
    veuModal.querySelector('#p2-m-menos').disabled = m.qtd <= 1;
    veuModal.querySelector('#p2-m-mais').disabled = m.qtd >= 9;
    var msg = veuModal.querySelector('#p2-m-cupom-msg');
    var ok = cupomValido(m.cupom);
    if (!m.cupom) { msg.textContent = ''; msg.className = 'cupom-msg'; }
    else if (ok) { msg.textContent = 'Cupom BEMVINDO10 aplicado: 10% off.'; msg.className = 'cupom-msg ok'; }
    else { msg.textContent = 'Cupom inválido. Tente BEMVINDO10.'; msg.className = 'cupom-msg erro'; }

    var bruto = porId(m.id).preco * m.qtd;
    var tot = totalModal();
    // REFINO B10 · total com contagem suave (sem piscar)
    (function animarTotal(el, destino) {
      var anterior = parseInt(el.getAttribute('data-valor') || String(destino), 10);
      if (isNaN(anterior)) anterior = destino;
      el.setAttribute('data-valor', String(destino));
      if (reduceMotion || anterior === destino) { el.textContent = moeda(destino); return; }
      var inicio = null, DUR = 320;
      el.classList.add('trocando');
      function passo(ts) {
        if (!inicio) inicio = ts;
        var t = Math.min(1, (ts - inicio) / DUR);
        var ease = 1 - Math.pow(1 - t, 3);
        var atual = Math.round(anterior + (destino - anterior) * ease);
        el.textContent = moeda(atual);
        if (t < 1) requestAnimationFrame(passo);
        else { el.textContent = moeda(destino); el.classList.remove('trocando'); }
      }
      requestAnimationFrame(passo);
    })(veuModal.querySelector('#p2-m-total'), tot);
    var desc = veuModal.querySelector('#p2-m-desconto');
    if (ok) { desc.hidden = false; desc.textContent = '10% off aplicado (era ' + moeda(bruto) + ')'; }
    else { desc.hidden = true; desc.textContent = ''; }

    var texto = 'Olá Alexsander Ótica, quero o ' + p.nome + ' (' + p.formato + ' · ' + m.cor +
      ' · lente ' + m.lente + ') x' + m.qtd + ' — ' + moeda(tot) +
      (ok ? ' (cupom BEMVINDO10)' : '') + ' · Pagamento: Pix ou cartão';
    veuModal.querySelector('#p2-m-zap').href = linkZap(texto);
    renderPassos();
  }

  /* EV6 · progresso sincronizado com o estado real: etapa 1 feita quando há
     modelo + cor (default conta como escolhida); etapa 2 feita quando a lente
     é tocada (m.lenteOk); etapa 3 é o destino (conclui ao adicionar). */
  function renderPassos() {
    var ol = veuModal.querySelector('#p2-passos');
    if (!ol) return;
    var conf = [{ feito: !!(m.id && m.cor) }, { feito: !!m.lenteOk }, { feito: false }];
    var atual = conf[0].feito ? (conf[1].feito ? 2 : 1) : 0;
    var itens = ol.querySelectorAll('[data-passo]');
    itens.forEach(function (li, i) {
      var n = li.querySelector('.passo-n');
      li.classList.toggle('feito', !!conf[i].feito);
      li.classList.toggle('atual', i === atual && !conf[i].feito);
      if (n) n.textContent = conf[i].feito ? '✓' : String(i + 1);
      if (i === atual && !conf[i].feito) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
  }

  var ultimoFocoModal = null;
  function abrirModal(id, origem) {
    var p = porId(id);
    if (!p) return;
    m = { id: id, foto: 0, cor: corSel[id] || p.cores[0], lente: p.tipo === 'optico' ? 'Antirreflexo' : 'Polarizada', lenteOk: false, qtd: 1, cupom: sacola.cupom || '', origem: origem || null };
    ultimoFocoModal = document.activeElement;
    veuModal.querySelector('#p2-m-cupom').value = m.cupom;
    renderModal();
    veuModal.hidden = false;
    if (window.OTICA.travarScroll) window.OTICA.travarScroll();
    else document.body.style.overflow = 'hidden';
    // REFINO B9 · foco vai para o primeiro controle ao abrir o modal
    veuModal.querySelector('.modal-fechar').focus();
  }
  function fecharModal() {
    if (veuModal.hidden) return;
    var mf = veuModal.querySelector('.modal-foto');
    if (mf) mf.classList.remove('macro');
    veuModal.classList.add('saindo');
    setTimeout(function () {
      veuModal.hidden = true;
      veuModal.classList.remove('saindo');
      if (window.OTICA.destravarScroll) window.OTICA.destravarScroll();
      else document.body.style.overflow = '';
      if (ultimoFocoModal && ultimoFocoModal.focus) ultimoFocoModal.focus();
    }, reduceMotion ? 0 : 180);
  }

  veuModal.querySelector('[data-fechar]').addEventListener('click', fecharModal);
  veuModal.addEventListener('mousedown', function (ev) { if (ev.target === veuModal) fecharModal(); });
  /* EV2 · macro-zoom: transform-origin segue o mouse, lupa 1.8x via CSS,
     saída suave no mouseleave. Só pointer fino, sem reduced-motion. */
  (function macroZoom() {
    if (!pointerFino || reduceMotion) return;
    var moldura = veuModal.querySelector('.modal-foto');
    var foto = veuModal.querySelector('#p2-m-foto');
    if (!moldura || !foto) return;
    moldura.addEventListener('mousemove', function (ev) {
      var r = moldura.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var x = ((ev.clientX - r.left) / r.width) * 100;
      var y = ((ev.clientY - r.top) / r.height) * 100;
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      foto.style.transformOrigin = x.toFixed(1) + '% ' + y.toFixed(1) + '%';
      moldura.classList.add('macro');
    });
    moldura.addEventListener('mouseleave', function () {
      moldura.classList.remove('macro');
    });
  })();
  veuModal.querySelector('#p2-m-menos').addEventListener('click', function () { m.qtd = Math.max(1, m.qtd - 1); renderModal(); });
  veuModal.querySelector('#p2-m-mais').addEventListener('click', function () { m.qtd = Math.min(9, m.qtd + 1); renderModal(); });
  veuModal.querySelector('#p2-m-cupom-btn').addEventListener('click', function () {
    m.cupom = veuModal.querySelector('#p2-m-cupom').value.trim().toUpperCase();
    renderModal();
  });
  veuModal.querySelector('#p2-m-cupom').addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); m.cupom = ev.target.value.trim().toUpperCase(); renderModal(); }
  });
  veuModal.querySelector('#p2-m-add').addEventListener('click', function (ev) {
    var p = porId(m.id);
    var src = p ? p.fotos[m.foto] : null;
    adicionarItem(m.id, m.cor, m.lente, m.qtd, m.cupom);
    try { voarParaSacola(ev.currentTarget, src); } catch (e) {}
    fecharModal();
  });
  // REFINO A2 · checkout do modal também destrava (fecha o modal ao pedir no Zap)
  veuModal.querySelector('#p2-m-zap').addEventListener('click', function () {
    setTimeout(fecharModal, 60);
  });
  // Teclado: Escape fecha + setas alternam foto + trap de Tab dentro do modal
  document.addEventListener('keydown', function (ev) {
    if (veuModal.hidden) return;
    if (ev.key === 'Escape') { ev.preventDefault(); fecharModal(); return; }
    // R4 · galeria por teclado: ←/→ com wrap-around, sem quebrar Escape/Tab.
    // Ignora quando o foco está em campo de texto (cupom) para não roubar digitação.
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      var tag = (ev.target && ev.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      var pp = porId(m.id);
      if (!pp || !pp.fotos || pp.fotos.length < 2) return;
      ev.preventDefault();
      var dir = ev.key === 'ArrowRight' ? 1 : -1;
      m.foto = (m.foto + dir + pp.fotos.length) % pp.fotos.length;
      renderModal();
      return;
    }
    if (ev.key !== 'Tab') return;
    var focos = veuModal.querySelectorAll('button, a[href], input, select, [tabindex]:not([tabindex="-1"])');
    focos = Array.prototype.filter.call(focos, function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focos.length) return;
    var primeiro = focos[0], ultimo = focos[focos.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
  });

  /* ---------- Sacola (gaveta + localStorage) ---------- */
  var sacola = { itens: [], cupom: '', metodo: 'pix' };
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE_SACOLA) || 'null');
    if (salvo && Array.isArray(salvo.itens)) {
      sacola.itens = salvo.itens.filter(function (it) { return porId(it.id); });
      sacola.cupom = typeof salvo.cupom === 'string' ? salvo.cupom : '';
      sacola.metodo = salvo.metodo === 'cartao' ? 'cartao' : 'pix';
    }
  } catch (e) { /* armazenamento indisponível: segue em memória */ }

  function salvarSacola() {
    try { localStorage.setItem(CHAVE_SACOLA, JSON.stringify(sacola)); } catch (e) {}
  }
  function qtdTotal() {
    return sacola.itens.reduce(function (s, it) { return s + (it.qtd || 0); }, 0);
  }
  function subtotal() {
    return sacola.itens.reduce(function (s, it) {
      var p = porId(it.id);
      return s + (p ? p.preco * it.qtd : 0);
    }, 0);
  }
  function totais() {
    var sub = subtotal();
    var ok = cupomValido(sacola.cupom);
    var desc = ok ? Math.round(sub * DESCONTO) : 0;
    return { sub: sub, desc: desc, total: sub - desc, ok: ok };
  }

  var veuGaveta = document.createElement('div');
  veuGaveta.className = 'gaveta-veu';
  veuGaveta.hidden = true;
  var gaveta = document.createElement('aside');
  gaveta.className = 'gaveta';
  gaveta.setAttribute('role', 'dialog');
  gaveta.setAttribute('aria-modal', 'true');
  gaveta.setAttribute('aria-labelledby', 'p2-sacola-titulo');
  gaveta.innerHTML =
    '<div class="gaveta-topo"><h2 id="p2-sacola-titulo">Sua sacola</h2><span class="n" id="p2-sacola-n">0</span>' +
    '<button class="gaveta-fechar" type="button" data-fechar aria-label="Fechar sacola">✕</button></div>' +
    '<div class="gaveta-corpo" id="p2-sacola-corpo"></div>' +
    '<div class="gaveta-rodape">' +
      '<div><p class="pag-titulo"><label for="p2-sacola-cupom">Cupom de desconto</label></p>' +
      '<div class="cupom"><input id="p2-sacola-cupom" placeholder="BEMVINDO10" autocomplete="off" spellcheck="false" />' +
      '<button type="button" id="p2-sacola-cupom-btn">Aplicar</button></div>' +
      '<p class="cupom-msg" id="p2-sacola-cupom-msg" aria-live="polite"></p></div>' +
      '<div><p class="pag-titulo">Pagamento</p><div class="pag-grupo" role="group" aria-label="Forma de pagamento">' +
        '<button type="button" class="pag-opcao" data-metodo="pix" aria-pressed="true">◈ Pix</button>' +
        '<button type="button" class="pag-opcao" data-metodo="cartao" aria-pressed="false">▦ Cartão</button>' +
      '</div></div>' +
      '<div class="resumo" id="p2-sacola-resumo"></div>' +
      '<div class="gaveta-checkout">' +
        '<a class="btn btn--solido" id="p2-sacola-zap" target="_blank" rel="noopener" href="#">Finalizar no WhatsApp ↗</a>' +
        '<button class="gaveta-continuar" type="button" id="p2-continuar">Continuar comprando</button>' +
        '<button class="gaveta-esvaziar" type="button" id="p2-sacola-esvaziar">Esvaziar sacola</button>' +
      '</div>' +
      '<p class="gaveta-nota" id="p2-sacola-nota"></p>' +
    '</div>';
  document.body.appendChild(veuGaveta);
  document.body.appendChild(gaveta);
  gaveta.hidden = true;

  var corpoSacola = gaveta.querySelector('#p2-sacola-corpo');
  var numSacola = gaveta.querySelector('#p2-sacola-n');

  function pedidoTexto() {
    var t = totais();
    var linhas = sacola.itens.map(function (it) {
      var p = porId(it.id);
      return '• ' + it.qtd + 'x ' + p.nome + ' (' + it.cor + ' · ' + it.lente + ') — ' + moeda(p.preco * it.qtd);
    });
    return 'Olá Alexsander Ótica, quero fechar meu pedido:%0A' +
      encodeURIComponent(linhas.join('\n')) + '%0A' +
      encodeURIComponent('Subtotal: ' + moeda(t.sub)) +
      (t.ok ? '%0A' + encodeURIComponent('Cupom BEMVINDO10 (−10%): −' + moeda(t.desc)) : '') + '%0A' +
      encodeURIComponent('Total: ' + moeda(t.total)) + '%0A' +
      encodeURIComponent('Pagamento: ' + (sacola.metodo === 'pix' ? 'Pix' : 'Cartão'));
  }

  function renderSacola() {
    var t = totais();
    numSacola.textContent = String(qtdTotal());
    corpoSacola.innerHTML = '';

    if (!sacola.itens.length) {
      var vz = document.createElement('div');
      vz.className = 'gaveta-vazio';
      vz.innerHTML = '<span class="oculos" aria-hidden="true">🕶️</span>' +
        '<h3>Sacola vazia</h3><p>Escolha um modelo da coleção para começar.</p>';
      corpoSacola.appendChild(vz);
    } else {
      sacola.itens.forEach(function (it, idx) {
        var p = porId(it.id);
        var el = document.createElement('div');
        el.className = 'sacola-item' + (chaveNova === it.id + '|' + it.cor + '|' + it.lente ? ' novo' : '');
        el.innerHTML =
          '<img src="' + p.fotos[0] + '" alt="" loading="lazy" decoding="async" />' +
          '<div><h4>' + escapar(p.nome) + '</h4>' +
          '<p class="var">' + escapar(p.formato + ' · ' + it.cor + ' · ' + it.lente) + '</p>' +
          '<p class="preco-linha">' + moeda(p.preco) + ' un.</p>' +
          '<div class="sacola-qtd">' +
            '<button type="button" data-menos aria-label="Diminuir ' + escapar(p.nome) + '"' + (it.qtd <= 1 ? ' disabled' : '') + '>−</button>' +
            '<output aria-live="polite">' + it.qtd + '</output>' +
            '<button type="button" data-mais aria-label="Aumentar ' + escapar(p.nome) + '"' + (it.qtd >= 9 ? ' disabled' : '') + '>+</button>' +
          '</div></div>' +
          '<div class="sacola-lateral"><span class="sacola-sub">' + precoRico(p.preco * it.qtd) + '</span>' +
          '<button type="button" class="sacola-remover" data-remover>Remover</button></div>';
        el.querySelector('[data-menos]').addEventListener('click', function () {
          it.qtd = Math.max(1, it.qtd - 1); salvarSacola(); renderSacola();
        });
        el.querySelector('[data-mais]').addEventListener('click', function () {
          it.qtd = Math.min(9, it.qtd + 1); salvarSacola(); renderSacola();
        });
        el.querySelector('[data-remover]').addEventListener('click', function () {
          sacola.itens.splice(idx, 1); salvarSacola(); renderSacola();
        });
        corpoSacola.appendChild(el);
      });
    }

    var msg = gaveta.querySelector('#p2-sacola-cupom-msg');
    if (!sacola.cupom) { msg.textContent = 'Tem cupom BEMVINDO10? Aplique e ganhe 10% off.'; msg.className = 'cupom-msg'; }
    else if (t.ok) { msg.textContent = 'Cupom BEMVINDO10 aplicado: 10% off.'; msg.className = 'cupom-msg ok'; }
    else { msg.textContent = 'Cupom inválido. Tente BEMVINDO10.'; msg.className = 'cupom-msg erro'; }

    gaveta.querySelectorAll('[data-metodo]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-metodo') === sacola.metodo ? 'true' : 'false');
    });

    var res = gaveta.querySelector('#p2-sacola-resumo');
    res.innerHTML =
      '<div class="resumo-linha"><span>Subtotal</span><span>' + moeda(t.sub) + '</span></div>' +
      (t.ok ? '<div class="resumo-linha desconto"><span>Cupom BEMVINDO10 (−10%)</span><span>−' + moeda(t.desc) + '</span></div>' : '') +
      '<div class="resumo-total"><span>Total</span><span>' + moeda(t.total) + '</span></div>';

    var zap = gaveta.querySelector('#p2-sacola-zap');
    if (!sacola.itens.length) {
      zap.setAttribute('aria-disabled', 'true');
      zap.style.opacity = '.5';
      zap.style.pointerEvents = 'none';
      zap.href = '#';
    } else {
      zap.removeAttribute('aria-disabled');
      zap.style.opacity = '';
      zap.style.pointerEvents = '';
      zap.href = 'https://wa.me/' + WHATS + '?text=' + pedidoTexto();
    }
    gaveta.querySelector('#p2-sacola-nota').textContent =
      sacola.metodo === 'pix'
        ? 'No Pix: você confirma o pedido no WhatsApp e recebe a chave na hora.'
        : 'No cartão: pagamento na loja ou link — combine no WhatsApp.';

    atualizarSacola(qtdTotal());
    chaveNova = null;
  }

  var ultimoFocoSacola = null;
  function abrirSacola() {
    ultimoFocoSacola = document.activeElement;
    renderSacola();
    veuGaveta.hidden = false;
    gaveta.hidden = false;
    if (window.OTICA.travarScroll) window.OTICA.travarScroll();
    else document.body.style.overflow = 'hidden';
    // REFINO B9 · foco vai para o primeiro controle ao abrir a gaveta
    gaveta.querySelector('[data-fechar]').focus();
  }
  function fecharSacola() {
    if (gaveta.hidden && veuGaveta.hidden) return;
    veuGaveta.hidden = true;
    gaveta.hidden = true;
    if (window.OTICA.destravarScroll) window.OTICA.destravarScroll();
    else document.body.style.overflow = '';
    var btn = document.getElementById('p2-sacola-esvaziar');
    if (btn) { btn.textContent = 'Esvaziar sacola'; btn.classList.remove('confirmar'); }
    // REFINO B9 · foco vai para #cart-abrir ao fechar a gaveta
    var abrir = document.getElementById('cart-abrir');
    if (abrir) abrir.focus();
    else if (ultimoFocoSacola && ultimoFocoSacola.focus) ultimoFocoSacola.focus();
  }

  function atualizarSacola(n) {
    var num = document.getElementById('cart-num');
    if (num) num.textContent = String(Math.max(0, parseInt(n, 10) || 0));
    var btn = document.getElementById('cart-abrir');
    if (btn) {
      var q = Math.max(0, parseInt(n, 10) || 0);
      btn.setAttribute('aria-label', q === 0 ? 'Abrir sacola de compras (vazia)' : 'Abrir sacola de compras (' + q + ' itens)');
    }
  }

  window.OTICA.atualizarSacola = atualizarSacola;
  window.OTICA.abrirSacola = abrirSacola;
  window.OTICA.fecharSacola = fecharSacola;

  gaveta.querySelector('[data-fechar]').addEventListener('click', fecharSacola);
  veuGaveta.addEventListener('mousedown', function (ev) { if (ev.target === veuGaveta) fecharSacola(); });
  // REFINO A2 · Escape já fechava; garante destrava por véu/botão/checkout
  gaveta.querySelector('#p2-sacola-zap').addEventListener('click', function () {
    // Checkout abre o WhatsApp em nova aba; fecha a gaveta e libera o scroll.
    setTimeout(fecharSacola, 60);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !gaveta.hidden) { ev.preventDefault(); fecharSacola(); }
  });
  gaveta.querySelectorAll('[data-metodo]').forEach(function (b) {
    b.addEventListener('click', function () {
      sacola.metodo = b.getAttribute('data-metodo');
      salvarSacola(); renderSacola();
    });
  });
  function aplicarCupomSacola() {
    sacola.cupom = gaveta.querySelector('#p2-sacola-cupom').value.trim().toUpperCase();
    salvarSacola(); renderSacola();
  }
  gaveta.querySelector('#p2-sacola-cupom-btn').addEventListener('click', aplicarCupomSacola);
  gaveta.querySelector('#p2-sacola-cupom').addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); aplicarCupomSacola(); }
  });
  gaveta.querySelector('#p2-sacola-esvaziar').addEventListener('click', function (ev) {
    var btn = ev.currentTarget;
    if (!sacola.itens.length) return;
    if (!btn.classList.contains('confirmar')) {
      btn.classList.add('confirmar');
      btn.textContent = 'Confirmar: esvaziar tudo?';
      return;
    }
    sacola.itens = [];
    salvarSacola(); renderSacola();
    btn.textContent = 'Esvaziar sacola';
    btn.classList.remove('confirmar');
  });
  // R4 · "Continuar comprando": fecha a gaveta sem devolver foco à sacola,
  // rola até #colecao e foca o título para teclado/leitores de tela.
  var btnContinuar = gaveta.querySelector('#p2-continuar');
  if (btnContinuar) {
    btnContinuar.addEventListener('click', function () {
      veuGaveta.hidden = true;
      gaveta.hidden = true;
      if (window.OTICA.destravarScroll) window.OTICA.destravarScroll();
      else document.body.style.overflow = '';
      var esv = gaveta.querySelector('#p2-sacola-esvaziar');
      if (esv) { esv.textContent = 'Esvaziar sacola'; esv.classList.remove('confirmar'); }
      var colecao = document.getElementById('colecao');
      var titulo = document.getElementById('colecao-titulo');
      if (colecao) {
        try { colecao.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
        catch (e) { colecao.scrollIntoView(); }
      }
      if (titulo) {
        if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1');
        setTimeout(function () { try { titulo.focus({ preventScroll: true }); } catch (e2) { titulo.focus(); } }, reduceMotion ? 0 : 450);
      }
    });
  }

  /* ---------- Toast dourado ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span class="selo" aria-hidden="true">✓</span><span id="p2-toast-msg"></span><button type="button" id="p2-toast-ver">Ver sacola</button><span class="toast-bar" aria-hidden="true"><i id="p2-toast-barra"></i></span>';
  document.body.appendChild(toast);
  var toastTimer = null;
  /* EV7 · chave do item recém-adicionado para a animação "sacola viva". */
  var chaveNova = null;
  toast.querySelector('#p2-toast-ver').addEventListener('click', function () {
    toast.classList.remove('visivel');
    abrirSacola();
  });
  function mostrarToast(texto) {
    toast.querySelector('#p2-toast-msg').textContent = texto;
    toast.classList.add('visivel');
    /* EV7 · reinicia a barra de progresso junto com o auto-dismiss (3.4s). */
    var barra = toast.querySelector('#p2-toast-barra');
    if (barra && !reduceMotion) {
      barra.style.animation = 'none';
      void barra.offsetWidth;
      barra.style.animation = '';
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('visivel'); }, 3400);
  }

  /* EV7 · "voo" da sacola: thumbnail que encolhe do botão até a sacola
     (FLIP simplificado via getBoundingClientRect + transition). Sem
     reduced-motion e sem geometria válida, retorna false (fallback: o
     item entra com fade pela classe .novo, animada em CSS). */
  function voarParaSacola(origemEl, src) {
    if (reduceMotion || !origemEl || !src) return false;
    var alvo = document.getElementById('cart-abrir');
    if (!alvo) return false;
    var r1 = origemEl.getBoundingClientRect();
    var r2 = alvo.getBoundingClientRect();
    if (!r1.width || !r1.height || !r2.width || !r2.height) return false;
    var TAM = 88;
    var x1 = r1.left + r1.width / 2 - TAM / 2;
    var y1 = r1.top + r1.height / 2 - TAM / 2;
    var x2 = r2.left + r2.width / 2 - TAM / 2;
    var y2 = r2.top + r2.height / 2 - TAM / 2;
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'voo-thumb';
    img.style.left = x1 + 'px';
    img.style.top = y1 + 'px';
    img.style.width = TAM + 'px';
    img.style.height = TAM + 'px';
    document.body.appendChild(img);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        img.style.transform = 'translate(' + (x2 - x1).toFixed(1) + 'px,' + (y2 - y1).toFixed(1) + 'px) scale(.14)';
        img.style.opacity = '.3';
      });
    });
    setTimeout(function () { if (img.parentNode) img.parentNode.removeChild(img); }, 680);
    return true;
  }

  function adicionarItem(id, cor, lente, qtd, cupom) {
    var achou = null;
    chaveNova = id + '|' + cor + '|' + lente;
    sacola.itens.forEach(function (it) {
      if (it.id === id && it.cor === cor && it.lente === lente) achou = it;
    });
    if (achou) achou.qtd = Math.min(9, achou.qtd + qtd);
    else sacola.itens.push({ id: id, cor: cor, lente: lente, qtd: Math.min(9, Math.max(1, qtd)) });
    if (cupom && cupomValido(cupom)) sacola.cupom = cupom;
    salvarSacola(); renderSacola();
    var p = porId(id);
    mostrarToast(p.nome + ' (' + cor + ') na sacola ✓');
  }
  window.OTICA.adicionarItem = adicionarItem;

  /* ---------- Boot ---------- */
  gaveta.querySelector('#p2-sacola-cupom').value = sacola.cupom || '';
  renderGrade();
  renderSacola();
  observarReveals(montagem);

})();

/* ============================================================
   PARTE 3 — lentes/materiais/guia/avaliações/faq/loja/contato/
   rodapé completo + WhatsApp flutuante (JS puro, sem dependências)
   Monta tudo dentro de #app-resto; reaproveita o padrão .reveal
   das Partes 1 e 2 com observer próprio. Lê window.OTICA.produtos
   e window.OTICA.whatsapp (leitura apenas — NÃO redefine
   window.OTICA.produtos/atualizarSacola/abrirSacola). O filtro da
   guia dispara a busca da coleção (Parte 2) via eventos, sem
   duplicar lógica. Respeita prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var resto = document.getElementById('app-resto');
  if (!resto) return;

  var WHATS = (window.OTICA && window.OTICA.whatsapp) || '5521984816082';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function linkZap(texto) {
    return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(texto);
  }

  /* Contagem honesta por formato a partir dos dados da Parte 2 (só leitura) */
  var PRODS = (window.OTICA && window.OTICA.produtos) || [];
  function contarFormato(nome) {
    var n = norm(nome);
    var q = 0;
    PRODS.forEach(function (p) { if (norm(p.formato) === n) q++; });
    return q;
  }

  var GUIA = [
    { nome: 'Redondo', classe: 'p3-forma--redondo', dica: 'Leve e criativo, fácil de combinar.' },
    { nome: 'Oval', classe: 'p3-forma--oval', dica: 'Curvas suaves que alongam o olhar.' },
    { nome: 'Quadrado', classe: 'p3-forma--quadrado', dica: 'Marcante na medida, do casual ao arrumado.' },
    { nome: 'Aviador', classe: 'p3-forma--aviador', dica: 'O clássico que nunca sai de cena.' }
  ];
  var guiaCards = GUIA.map(function (g, i) {
    var q = contarFormato(g.nome);
    var selo = q > 0 ? q + (q === 1 ? ' modelo na coleção' : ' modelos na coleção') : 'sob consulta na loja';
    return '<button class="p3-guia-card reveal" style="--d:' + (i * 0.07).toFixed(2) + 's" type="button" ' +
      'data-guia="' + g.nome + '" aria-label="Filtrar coleção: formato ' + g.nome + ' (' + selo + ')">' +
      '<span class="p3-forma ' + g.classe + '" aria-hidden="true"></span>' +
      '<h3>' + g.nome + '</h3><small>' + selo + '</small>' +
      '<span class="p3-guia-ir" aria-hidden="true">Ver na coleção ↓</span></button>';
  }).join('');

  var ROTA = 'https://www.google.com/maps/search/?api=1&query=Av.+Uni%C3%A3o+735+Mesquita+RJ';
  var GOOGLE_PERFIL = 'https://www.google.com/maps?cid=16493775369192153875';

  resto.innerHTML =
    '<section id="lentes" class="secao secao--escura" aria-labelledby="p3-lentes-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow eyebrow--clara reveal">Escolha sua lente</p>' +
          '<h2 class="p3-titulo reveal" id="p3-lentes-titulo" style="--d:.08s">Mais conforto <em>em cada olhar.</em></h2>' +
          '<p class="p3-lead reveal" style="--d:.16s">Quatro tecnologias para o seu dia a dia. Escolha a ideal e veja as armações da coleção.</p>' +
        '</div>' +
        '<ul class="p3-lentes-grade">' +
          '<li><article class="p3-lente reveal" style="--d:.2s"><span class="p3-lente-num" aria-hidden="true">01</span><span class="p3-lente-ico p3-lente-ico--transparente" aria-hidden="true"></span><h3>Transparente</h3><p>Leve e versátil para o dia a dia.</p><p class="p3-lente-preco">A partir de · preço sob consulta</p><a class="p3-lente-cta" href="#colecao">Escolher na coleção <span aria-hidden="true">→</span></a></article></li>' +
          '<li><article class="p3-lente reveal" style="--d:.27s"><span class="p3-lente-num" aria-hidden="true">02</span><span class="p3-lente-ico p3-lente-ico--antirreflexo" aria-hidden="true"></span><h3>Antirreflexo</h3><p>Mais nitidez para telas e direção.</p><p class="p3-lente-preco">A partir de · preço sob consulta</p><a class="p3-lente-cta" href="#colecao">Escolher na coleção <span aria-hidden="true">→</span></a></article></li>' +
          '<li><article class="p3-lente reveal" style="--d:.34s"><span class="p3-lente-num" aria-hidden="true">03</span><span class="p3-lente-ico p3-lente-ico--fotossensivel" aria-hidden="true"></span><h3>Fotossensível</h3><p>Clara em ambientes fechados, escura no sol.</p><p class="p3-lente-preco">A partir de · preço sob consulta</p><a class="p3-lente-cta" href="#colecao">Escolher na coleção <span aria-hidden="true">→</span></a></article></li>' +
          '<li><article class="p3-lente reveal" style="--d:.41s"><span class="p3-lente-num" aria-hidden="true">04</span><span class="p3-lente-ico p3-lente-ico--polarizada" aria-hidden="true"></span><h3>Polarizada</h3><p>Reduz reflexos e realça as cores.</p><p class="p3-lente-preco">A partir de · preço sob consulta</p><a class="p3-lente-cta" href="#colecao">Escolher na coleção <span aria-hidden="true">→</span></a></article></li>' +
        '</ul>' +
      '</div>' +
    '</section>' +
    '<section id="materiais" class="secao secao--clara" aria-labelledby="p3-mats-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow reveal">Por dentro da Alexsander</p>' +
          '<h2 class="p3-titulo reveal" id="p3-mats-titulo" style="--d:.08s">Materiais que <em>fazem diferença.</em></h2>' +
          '<p class="p3-lead reveal" style="--d:.16s">Cada acabamento foi escolhido para equilibrar leveza, resistência e personalidade.</p>' +
        '</div>' +
        '<div class="p3-mats">' +
          '<article class="p3-mat reveal" style="--d:.2s"><span class="p3-mat-num" aria-hidden="true">01</span><h3>Acetato italiano</h3><p>Toque confortável, cores profundas e brilho natural. Ideal para quem usa óculos o dia todo.</p></article>' +
          '<article class="p3-mat reveal" style="--d:.27s"><span class="p3-mat-num" aria-hidden="true">02</span><h3>Metal premium</h3><p>Linhas finas e ajuste delicado para um visual preciso, elegante e quase imperceptível.</p></article>' +
          '<article class="p3-mat reveal" style="--d:.34s"><span class="p3-mat-num" aria-hidden="true">03</span><h3>Lentes com proteção UV</h3><p>Confirme a proteção e as especificações de cada modelo com a equipe: a cor escura, por si só, não comprova proteção UV.</p></article>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section id="guia" class="secao secao--branca" aria-labelledby="p3-guia-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow reveal">Guia rápido</p>' +
          '<h2 class="p3-titulo reveal" id="p3-guia-titulo" style="--d:.08s">Descubra seu <em>formato ideal.</em></h2>' +
          '<p class="p3-lead reveal" style="--d:.16s">Toque em um formato para filtrar a coleção na hora. O mais importante é você se sentir bem usando.</p>' +
        '</div>' +
        '<div class="p3-guia-grade" role="group" aria-label="Filtrar a coleção por formato">' + guiaCards + '</div>' +
        '<p class="p3-nota reveal"><strong>Dica de especialista:</strong> use o filtro como ponto de partida e prove no rosto — o caimento real (apoio no nariz e atrás das orelhas) só se confirma usando. Em dúvida, chame a equipe no WhatsApp.</p>' +
      '</div>' +
    '</section>' +
    '<section id="avaliacoes" class="secao secao--escura" aria-labelledby="p3-aval-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow eyebrow--clara reveal">Quem escolhe a Alexsander</p>' +
          '<h2 class="p3-titulo reveal" id="p3-aval-titulo" style="--d:.08s">Cuidado que vira <em>recomendação.</em></h2>' +
        '</div>' +
        '<a class="p3-score reveal" style="--d:.16s" href="' + GOOGLE_PERFIL + '" target="_blank" rel="noopener" aria-label="Nota 5 de 5, 29 avaliações no Google — ver todas">' +
          '<span class="p3-score-num">5,0 <small>/ 5</small></span>' +
          '<span class="p3-score-txt"><span class="p3-estrelas" aria-hidden="true">★★★★★</span><br />29 avaliações no Google ↗</span>' +
        '</a>' +
        '<ul class="p3-revs" aria-roledescription="carousel" aria-label="Depoimentos de clientes">' +
          '<li><figure class="p3-rev reveal" style="--d:.2s"><span class="p3-estrelas" role="img" aria-label="5 de 5 estrelas">★★★★★</span><blockquote><p>“Gostei muito do tratamento, facilita a forma de pagamento.”</p></blockquote><figcaption><span class="p3-avatar" aria-hidden="true">TL</span><span><strong>Taiane Lima</strong><small>Avaliação no Google</small></span></figcaption><p><a class="p3-rev-link" href="https://maps.app.goo.gl/qDBtrJvw7MzpdN8i9" target="_blank" rel="noopener">Ler avaliação completa ↗</a></p></figure></li>' +
          '<li><figure class="p3-rev reveal" style="--d:.27s"><span class="p3-estrelas" role="img" aria-label="5 de 5 estrelas">★★★★★</span><blockquote><p>“O atendimento é ótimo!”</p></blockquote><figcaption><span class="p3-avatar" aria-hidden="true">IP</span><span><strong>Isabel Peres</strong><small>Avaliação no Google</small></span></figcaption><p><a class="p3-rev-link" href="https://maps.app.goo.gl/D5uB6egrPkgDQNt7A" target="_blank" rel="noopener">Ler avaliação completa ↗</a></p></figure></li>' +
          '<li><figure class="p3-rev reveal" style="--d:.34s"><span class="p3-estrelas" role="img" aria-label="5 de 5 estrelas">★★★★★</span><blockquote><p>“Atendimento excelente, super recomendo, atenção total ao cliente”</p></blockquote><figcaption><span class="p3-avatar" aria-hidden="true">VL</span><span><strong>Veronica Lacerda</strong><small>Avaliação no Google</small></span></figcaption><p><a class="p3-rev-link" href="https://maps.app.goo.gl/R7VwRW9kHe5iDicv5" target="_blank" rel="noopener">Ler avaliação completa ↗</a></p></figure></li>' +
        '</ul>' +
        '<div class="p3-car-nav">' +
          '<button class="p3-car-btn" type="button" data-car="prev" aria-label="Depoimento anterior">‹</button>' +
          '<div class="p3-dots" role="group" aria-label="Escolher depoimento">' +
            '<button class="p3-dot" type="button" data-dot="0" aria-label="Ir para depoimento 1" aria-current="true"></button>' +
            '<button class="p3-dot" type="button" data-dot="1" aria-label="Ir para depoimento 2" aria-current="false"></button>' +
            '<button class="p3-dot" type="button" data-dot="2" aria-label="Ir para depoimento 3" aria-current="false"></button>' +
          '</div>' +
          '<button class="p3-car-btn" type="button" data-car="next" aria-label="Próximo depoimento">›</button>' +
        '</div>' +
        '<a class="btn btn--solido reveal" style="--d:.4s" href="' + GOOGLE_PERFIL + '" target="_blank" rel="noopener">Avaliar no Google ↗</a>' +
      '</div>' +
    '</section>' +
    '<section id="faq" class="secao secao--clara" aria-labelledby="p3-faq-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow reveal">Dúvidas frequentes</p>' +
          '<h2 class="p3-titulo reveal" id="p3-faq-titulo" style="--d:.08s">Antes de <em>escolher.</em></h2>' +
          '<p class="p3-lead reveal" style="--d:.16s">Se ainda ficou alguma pergunta, nosso atendimento ajuda você a decidir.</p>' +
        '</div>' +
        '<div class="p3-faq-lista reveal" style="--d:.2s">' +
          '<div class="p3-faq-item aberto"><h3><button class="p3-faq-q" type="button" aria-expanded="true" aria-controls="p3-fa1" id="p3-fq1">Qual é o prazo de entrega?<span class="p3-faq-seta" aria-hidden="true">▾</span></button></h3><div class="p3-faq-a" id="p3-fa1" role="region" aria-labelledby="p3-fq1"><div><p>Prazo, entrega e valor são combinados com a equipe depois do orçamento. Depois da confirmação, a equipe orienta e acompanha cada etapa pelo WhatsApp.</p></div></div></div>' +
          '<div class="p3-faq-item"><h3><button class="p3-faq-q" type="button" aria-expanded="false" aria-controls="p3-fa2" id="p3-fq2">Os óculos têm garantia?<span class="p3-faq-seta" aria-hidden="true">▾</span></button></h3><div class="p3-faq-a" id="p3-fa2" role="region" aria-labelledby="p3-fq2"><div><p>Pergunte sobre a garantia e a cobertura de cada modelo antes de finalizar: a equipe explica as condições aplicáveis ao seu pedido, sem compromisso.</p></div></div></div>' +
          '<div class="p3-faq-item"><h3><button class="p3-faq-q" type="button" aria-expanded="false" aria-controls="p3-fa3" id="p3-fq3">Quais são as formas de pagamento?<span class="p3-faq-seta" aria-hidden="true">▾</span></button></h3><div class="p3-faq-a" id="p3-fa3" role="region" aria-labelledby="p3-fq3"><div><p>Pix, cartão de crédito e cartão de débito. Consulte a equipe sobre condições à vista e opções de parcelamento antes de fechar o pedido.</p></div></div></div>' +
          '<div class="p3-faq-item"><h3><button class="p3-faq-q" type="button" aria-expanded="false" aria-controls="p3-fa4" id="p3-fq4">Vocês fazem óculos de grau?<span class="p3-faq-seta" aria-hidden="true">▾</span></button></h3><div class="p3-faq-a" id="p3-fa4" role="region" aria-labelledby="p3-fq4"><div><p>Sim — temos armações ópticas como o Retangular Tartaruga (R$ 120). Traga sua receita e a equipe indica a armação e as lentes ideais para a sua rotina.</p></div></div></div>' +
          '<div class="p3-faq-item"><h3><button class="p3-faq-q" type="button" aria-expanded="false" aria-controls="p3-fa5" id="p3-fq5">Posso trocar ou cancelar meu pedido?<span class="p3-faq-seta" aria-hidden="true">▾</span></button></h3><div class="p3-faq-a" id="p3-fa5" role="region" aria-labelledby="p3-fq5"><div><p>Consulte as condições de troca e cancelamento com a equipe antes de finalizar uma compra real.</p></div></div></div>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section id="loja" class="secao secao--branca" aria-labelledby="p3-loja-titulo">' +
      '<div class="container">' +
        '<div class="p3-head">' +
          '<p class="eyebrow reveal">Visite a loja</p>' +
          '<h2 class="p3-titulo reveal" id="p3-loja-titulo" style="--d:.08s">Seu olhar, <em>bem cuidado.</em></h2>' +
        '</div>' +
        '<div class="p3-loja-card reveal" style="--d:.16s">' +
          '<div class="p3-loja-info">' +
            '<p class="p3-lead">Óculos e atendimento próximo em Mesquita: escolha armações, lentes e ajustes com segurança.</p>' +
            '<dl class="p3-loja-linhas">' +
              '<div class="p3-loja-linha"><dt>Endereço</dt><dd>Av. União, 735 — Santa Terezinha, Mesquita/RJ</dd></div>' +
              '<div class="p3-loja-linha"><dt>Horário</dt><dd>Seg–Sáb · 9h–18h</dd></div>' +
              '<div class="p3-loja-linha"><dt>WhatsApp</dt><dd><a href="' + linkZap('Olá Alexsander Ótica, quero conhecer os modelos') + '" target="_blank" rel="noopener">(21) 98481-6082</a></dd></div>' +
            '</dl>' +
            '<div class="p3-loja-acoes">' +
              '<a class="btn btn--solido" href="' + ROTA + '" target="_blank" rel="noopener">Traçar rota ↗</a>' +
              '<a class="p3-btn-linha" href="' + linkZap('Olá Alexsander Ótica, quero conhecer os modelos') + '" target="_blank" rel="noopener">Chamar no WhatsApp</a>' +
            '</div>' +
            '<p><span class="p3-selo"><span aria-hidden="true">✓</span> Retirada na loja</span></p>' +
            '<p class="p3-loja-vants-titulo">Por que passar na loja</p>' +
            '<ul class="p3-loja-vants" aria-label="Por que passar na loja">' +
              '<li>Pix e cartão na hora</li>' +
              '<li>Cupom BEMVINDO10 com −10%</li>' +
              '<li>5,0★ em 29 avaliações no Google</li>' +
            '</ul>' +
          '</div>' +
          '<div class="loja-lado">' +
            '<figure class="loja-foto reveal" style="--d:.24s">' +
              '<img src="./fotos/fachada-loja.jpg" alt="Fachada da Alexsander Ótica com porta de vidro e mostruário" width="335" height="192" loading="lazy" decoding="async" />' +
              '<figcaption>Nossa loja — pertinho de você</figcaption>' +
            '</figure>' +
            '<div class="p3-loja-mapa" role="img" aria-label="Mapa ilustrativo: Alexsander Ótica na Av. União, 735, Santa Terezinha, Mesquita, Rio de Janeiro">' +
              '<span class="p3-pino" aria-hidden="true"><span>📍</span></span>' +
              '<strong>Mesquita · RJ</strong>' +
              '<p>Av. União, 735 — pertinho de você. Toque em Traçar rota para chegar.</p>' +
            '</div>' +
          '</div>' +
          '<iframe class="p3-loja-live reveal" style="--d:.3s" title="Mapa: Alexsander Ótica, Av. União 735, Mesquita RJ" src="https://maps.google.com/maps?q=Av.%20Uni%C3%A3o%2C%20735%2C%20Santa%20Terezinha%2C%20Mesquita%20RJ&t=&z=16&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section id="contato" class="secao secao--escura" aria-labelledby="p3-contato-titulo">' +
      '<div class="container">' +
        '<p class="eyebrow eyebrow--clara reveal">Atendimento Alexsander Ótica</p>' +
        '<h2 class="p3-contato-titulo reveal" id="p3-contato-titulo" style="--d:.08s">Fale com a <em>Alexsander.</em></h2>' +
        '<p class="p3-lead reveal" style="--d:.16s">Conte como é sua rotina e a gente indica armações, lentes e tamanhos que fazem sentido.</p>' +
        '<div class="p3-contato-botoes reveal" style="--d:.22s">' +
          '<a class="btn btn--solido" href="' + linkZap('Olá Alexsander Ótica, quero ajuda para escolher meus óculos') + '" target="_blank" rel="noopener">Chamar no WhatsApp ↗</a>' +
          '<a class="btn btn--fantasma" href="#colecao">Ver coleção</a>' +
        '</div>' +
        '<form class="p3-mini-form reveal" style="--d:.28s" id="p3-form" novalidate>' +
          '<h3>Prefere escrever? A gente responde lá</h3>' +
          '<p>Monte sua mensagem aqui e envie direto no WhatsApp da loja.</p>' +
          '<div class="p3-campo"><label for="p3-nome">Seu nome</label><input id="p3-nome" name="nome" type="text" autocomplete="name" maxlength="60" placeholder="Ex.: Maria Silva" required aria-describedby="p3-nome-erro" /><p class="p3-erro" id="p3-nome-erro" role="alert" hidden></p></div>' +
          '<div class="p3-campo"><label for="p3-msg">Sua mensagem</label><textarea id="p3-msg" name="mensagem" rows="3" maxlength="500" placeholder="Ex.: Quero um solar aviador até R$ 100" required aria-describedby="p3-msg-erro"></textarea><p class="p3-erro" id="p3-msg-erro" role="alert" hidden></p></div>' +
          '<button class="btn btn--solido" type="submit">Enviar no WhatsApp ↗</button>' +
        '</form>' +
      '</div>' +
    '</section>' +
    '<footer class="p3-rodape" aria-label="Rodapé completo">' +
      '<div class="container">' +
        '<div class="p3-rodape-grade">' +
          '<div><a class="p3-rodape-marca" href="#topo" aria-label="Alexsander Ótica — voltar ao topo"><img src="./loja-perfil.png" alt="Logotipo da Alexsander Ótica" width="46" height="46" loading="lazy" decoding="async" /><span><strong>ALEXSANDER.</strong><small>Seu olhar, nosso cuidado</small></span></a>' +
          '<p class="p3-rodape-desc">Elegância, conforto e cuidado com a sua visão em Mesquita, RJ.</p></div>' +
          '<nav aria-label="Navegação do rodapé"><h3>Navegar</h3><ul><li><a href="#colecao">Coleção</a></li><li><a href="#lentes">Lentes</a></li><li><a href="#guia">Guia de formatos</a></li><li><a href="#avaliacoes">Avaliações</a></li><li><a href="#loja">Loja física</a></li><li><a href="#contato">Atendimento</a></li></ul></nav>' +
          '<div><h3>Contato</h3><ul><li>Av. União, 735 — Santa Terezinha, Mesquita/RJ</li><li>Seg–Sáb · 9h–18h</li><li><a href="' + linkZap('Olá Alexsander Ótica, quero conhecer os modelos') + '" target="_blank" rel="noopener">WhatsApp (21) 98481-6082 ↗</a></li></ul></div>' +
          '<div><h3>Pagamento</h3><ul><li>Pix</li><li>Cartão de crédito</li><li>Cartão de débito</li><li>Retirada na loja</li></ul></div>' +
        '</div>' +
        '<div class="p3-rodape-base"><p>© <span id="p3-ano-slot">2026</span> Alexsander Ótica · Mesquita, RJ</p><p>Feito com <span class="coracao" aria-hidden="true">♥</span> em Mesquita</p></div>' +
      '</div>' +
    '</footer>' +
    '<a class="p3-zap" href="' + linkZap('Olá Alexsander Ótica, quero conhecer os modelos') + '" target="_blank" rel="noopener" aria-label="Falar conosco no WhatsApp">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.6-.9 2 .3 4.7 2.7 6.4a7.8 7.8 0 0 0 4.5 1.7c.6 0 1.2-.2 1.6-.5.4-.3.8-.8.9-1.3.1-.2.1-.4 0-.5l-.3-.3z"/></svg>' +
      '<span class="p3-zap-tip" aria-hidden="true">Fale conosco</span>' +
    '</a>';

  /* ---------- Reveal próprio (mesmo padrão das Partes 1 e 2) ---------- */
  var ioP3 = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    ioP3 = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); ioP3.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  resto.querySelectorAll('.reveal').forEach(function (el) {
    if (!ioP3) el.classList.add('visible');
    else ioP3.observe(el);
  });

  /* ---------- FAQ: um aberto por vez, com aria-expanded ---------- */
  var itens = resto.querySelectorAll('.p3-faq-item');
  itens.forEach(function (item) {
    var btn = item.querySelector('.p3-faq-q');
    btn.addEventListener('click', function () {
      var abrir = !item.classList.contains('aberto');
      itens.forEach(function (outro) {
        outro.classList.remove('aberto');
        outro.querySelector('.p3-faq-q').setAttribute('aria-expanded', 'false');
      });
      if (abrir) {
        item.classList.add('aberto');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Guia: filtra a coleção via mecanismo da Parte 2 ---------- */
  resto.querySelectorAll('[data-guia]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var termo = btn.getAttribute('data-guia');
      var busca = document.getElementById('p2-busca');
      var sel = document.getElementById('p2-formato');
      var colecao = document.getElementById('colecao');
      if (!busca || !colecao) return;
      if (sel) {
        var existe = false;
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === termo) { existe = true; break; }
        }
        sel.value = existe ? termo : 'todos';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      busca.value = termo;
      busca.dispatchEvent(new Event('input', { bubbles: true }));
      colecao.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- Mini-form: abre o WhatsApp com texto montado ---------- */
  // REFINO C13 · erro inline acessível (aria-describedby), sem alert()
  var form = resto.querySelector('#p3-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nome = resto.querySelector('#p3-nome');
      var msg = resto.querySelector('#p3-msg');
      var erroNome = resto.querySelector('#p3-nome-erro');
      var erroMsg = resto.querySelector('#p3-msg-erro');
      var nomeOk = nome.value.trim() !== '';
      var msgOk = msg.value.trim() !== '';
      if (erroNome) {
        erroNome.textContent = nomeOk ? '' : 'Informe seu nome para a loja saber quem chama.';
        erroNome.hidden = nomeOk;
      }
      if (erroMsg) {
        erroMsg.textContent = msgOk ? '' : 'Escreva sua mensagem — ex.: quero um solar aviador até R$ 100.';
        erroMsg.hidden = msgOk;
      }
      nome.setAttribute('aria-invalid', nomeOk ? 'false' : 'true');
      msg.setAttribute('aria-invalid', msgOk ? 'false' : 'true');
      if (!nomeOk) { nome.focus(); return; }
      if (!msgOk) { msg.focus(); return; }
      var texto = 'Olá Alexsander Ótica, sou ' + nome.value.trim() + ': ' + msg.value.trim();
      window.open(linkZap(texto), '_blank', 'noopener');
    });
  }

  /* ---------- EV8 · Depoimentos: grade no desktop, carrossel ≤900px ---------- */
  /* Dots + setas, autoplay de 6s pausado no hover/foco, sem autoplay com
     reduced-motion. Textos e links dos 3 depoimentos seguem intactos. */
  (function carrosselRevs() {
    var lista = resto.querySelector('.p3-revs');
    var nav = resto.querySelector('.p3-car-nav');
    var secao = resto.querySelector('#avaliacoes');
    if (!lista || !nav) return;
    var slides = Array.prototype.slice.call(lista.querySelectorAll(':scope > li'));
    if (slides.length < 2) { nav.style.display = 'none'; return; }
    var dots = Array.prototype.slice.call(nav.querySelectorAll('[data-dot]'));
    var btnPrev = nav.querySelector('[data-car="prev"]');
    var btnNext = nav.querySelector('[data-car="next"]');
    slides.forEach(function (li, i) {
      li.setAttribute('aria-roledescription', 'slide');
      li.setAttribute('aria-label', (i + 1) + ' de ' + slides.length);
    });
    var idx = 0;
    var timer = null;
    function ehMobile() { return window.matchMedia('(max-width: 900px)').matches; }
    function pintar() {
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    }
    function ir(i, suave) {
      idx = ((i % slides.length) + slides.length) % slides.length;
      var li = slides[idx];
      if (li && ehMobile()) {
        var rL = lista.getBoundingClientRect();
        var rS = li.getBoundingClientRect();
        lista.scrollTo({
          left: lista.scrollLeft + (rS.left - rL.left) - 16,
          behavior: suave && !reduceMotion ? 'smooth' : 'auto'
        });
      }
      pintar();
    }
    if (btnPrev) btnPrev.addEventListener('click', function () { ir(idx - 1, true); reiniciar(); });
    if (btnNext) btnNext.addEventListener('click', function () { ir(idx + 1, true); reiniciar(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        ir(parseInt(d.getAttribute('data-dot'), 10) || 0, true);
        reiniciar();
      });
    });
    /* Scroll manual atualiza os dots (throttle via rAF). */
    var agendado = false;
    lista.addEventListener('scroll', function () {
      if (agendado || !ehMobile()) return;
      agendado = true;
      requestAnimationFrame(function () {
        agendado = false;
        var rL = lista.getBoundingClientRect();
        var melhor = 0, menor = Infinity;
        slides.forEach(function (li, i) {
          var rS = li.getBoundingClientRect();
          var dist = Math.abs((rS.left + rS.width / 2) - (rL.left + rL.width / 2));
          if (dist < menor) { menor = dist; melhor = i; }
        });
        if (melhor !== idx) { idx = melhor; pintar(); }
      });
    }, { passive: true });
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    function iniciar() {
      if (reduceMotion || timer) return;
      timer = setInterval(function () {
        if (document.hidden) return;
        if (ehMobile()) ir(idx + 1, true);
      }, 6000);
    }
    function reiniciar() { parar(); iniciar(); }
    if (secao) {
      secao.addEventListener('mouseenter', parar);
      secao.addEventListener('mouseleave', iniciar);
      secao.addEventListener('focusin', parar);
      secao.addEventListener('focusout', iniciar);
    }
    window.addEventListener('resize', function () { ir(idx, false); }, { passive: true });
    pintar();
    iniciar();
  })();

  /* ---------- Rodapé: preserva o <span id="ano"> original ---------- */
  var anoReal = document.getElementById('ano');
  var slot = resto.querySelector('#p3-ano-slot');
  if (anoReal && slot) {
    slot.replaceWith(anoReal);
  } else if (slot) {
    slot.id = 'ano';
    slot.textContent = String(new Date().getFullYear());
  } else {
    var restoAno = resto.querySelector('#ano');
    if (restoAno) restoAno.textContent = String(new Date().getFullYear());
  }
  var base = document.querySelector('body > footer');
  if (base && !base.contains(resto)) base.remove();

})();
