const NAVBAR_PLACEHOLDER_ID = 'navbar-placeholder';
const SYSTEMS_INFO_ID = 'dynamic-systems-info';

const SYSTEM_LINKS = [
  {
    text: 'Mapa da Rede',
    url: 'https://www.metro.sp.gov.br/sua-viagem/mapa-da-rede/',
  },
  {
    text: 'VIAQUATRO - Guia do Uso [PT/BR]',
    url: 'https://trilhos.motiva.com.br/linha-4-amarela/guia-de-uso/',
  },
  {
    text: 'VIAMOBILIDADE - LINHAS 5 E 17 - Guia do Uso [PT/BR]',
    url: 'https://trilhos.motiva.com.br/viamobilidade5/guia-de-uso/',
  },

  {
    text: 'LINHA UNI - Guia do Passageiro',
    url: 'https://www.linhauni.com.br/guia-do-passageiro',
  },

  {
    text: 'VIAMOBILIDADE - LINHAS 8 E 9 - Guia do Uso [PT/BR]',
    url: 'https://trilhos.motiva.com.br/viamobilidade8e9/guia-de-uso/',
  },
  {
    text: 'TIC TRENS - Informações Úteis [PT/BR]',
    url: 'https://www.tictrens.com.br/sua-viagem/informacoes-uteis',
  },
  {
    text: 'METRÔ - Guia do Passageiro [PT/BR]',
    url: 'https://www.metro.sp.gov.br/wp-content/uploads/2023/05/Guia_do_passageiro_abr_2022.pdf',
  },
  {
    text: 'METRÔ - Guia do Passageiro [EN/US]',
    url: 'https://www.metro.sp.gov.br/wp-content/uploads/2023/05/Desktop_Guide_abr_2022_v2.pdf',
  },
  {
    text: 'CPTM - Regulamento de Viagem',
    url: 'https://www.cptm.sp.gov.br/cptm/sua-viagem/regulamento-de-viagem',
  },
  {
    text: 'CPTM - Guia do Usuário - Expresso Turístico',
    url: 'https://www.cptm.sp.gov.br/cptm/sua-viagem/expresso-turistico',
  },
];

const SYSTEM_CONTACTS = [
  {
    name: 'ARTESP',
    site: 'www.artesp.sp.gov.br',
    url: 'https://www.artesp.sp.gov.br',
    phone: '0800 727 8377',
  },
  {
    name: 'CPTM',
    site: 'www.cptm.sp.gov.br',
    url: 'https://www.cptm.sp.gov.br',
    phone: '0800 055 0121',
  },
  {
    name: 'METRÔ',
    site: 'www.metro.sp.gov.br',
    url: 'https://www.metro.sp.gov.br',
    phone: '0800 770 7722',
  },
  {
    name: 'MOTIVA',
    site: 'trilhos.motiva.com.br',
    url: 'https://trilhos.motiva.com.br',
    phone: '0800 770 7100',
  },  
  {
    name: 'LINHA UNI',
    site: 'www.linhauni.com.br',
    url: 'https://www.linhauni.com.br',
    phone: '0800 580 3172',
  },   
  {
    name: 'SPTRANS',
    site: 'www.sptrans.com.br',
    url: 'https://www.sptrans.com.br',
    phone: '156',
  },
  {
    name: 'TIC TRENS',
    site: 'www.tictrens.com.br',
    url: 'https://www.tictrens.com.br',
    phone: '0800 007 0670',
  },
  {
    name: 'TRIVIA',
    site: 'www.triviatrens.com.br',
    url: 'https://www.triviatrens.com.br',
    phone: '0800 074 6733',
  },
];

async function loadNavbar() {
  const navbarContainer = document.getElementById(NAVBAR_PLACEHOLDER_ID);
  if (!navbarContainer) return;

  try {
    const response = await fetch('navbar.html');

    if (!response.ok) {
      throw new Error(`Navbar request failed: ${response.status}`);
    }

    navbarContainer.innerHTML = await response.text();
    highlightCurrentPage(navbarContainer);
  } catch (error) {
    console.error('Erro ao carregar a navbar:', error);
  }
}

function highlightCurrentPage(scope = document) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = scope.querySelectorAll('.nav-links a');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPage);
  });
}

function createExternalLink(url, text) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.textContent = text;

  return anchor;
}

function createOpenIcon() {
  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined inline-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = 'open_in_new';

  return icon;
}

function createSystemLinkItem(link) {
  const item = document.createElement('li');
  const anchor = createExternalLink(link.url, `${link.text} `);

  anchor.appendChild(createOpenIcon());
  item.appendChild(anchor);

  return item;
}

function createContactItem(contact) {
  const item = document.createElement('li');
  item.className = 'contact-item';

  const name = document.createElement('strong');
  name.textContent = contact.name;

  const site = createExternalLink(contact.url, contact.site);

  const phone = document.createElement('span');
  phone.textContent = contact.phone;

  item.append(name, site, phone);

  return item;
}

function renderSystemsInfo() {
  const container = document.getElementById(SYSTEMS_INFO_ID);
  if (!container) return;

  // Renderização via DOM evita interpolar conteúdo externo em HTML bruto.
  const section = document.createElement('section');
  section.className = 'data';

  const title = document.createElement('h2');
  title.textContent = 'Informações sobre os Sistemas';

  const linksList = document.createElement('ul');
  linksList.className = 'data-list';
  linksList.append(...SYSTEM_LINKS.map(createSystemLinkItem));

  const divider = document.createElement('hr');

  const contactSection = document.createElement('div');
  contactSection.className = 'contact-section';

  const contactTitle = document.createElement('h3');
  contactTitle.textContent = 'Canais de Atendimento e Portais Oficiais';

  const contactList = document.createElement('ul');
  contactList.className = 'contact-list';
  contactList.append(...SYSTEM_CONTACTS.map(createContactItem));

  contactSection.append(contactTitle, contactList);
  section.append(title, linksList, divider, contactSection);
  container.replaceChildren(section);
}

loadNavbar();

document.addEventListener('DOMContentLoaded', renderSystemsInfo);