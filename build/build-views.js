

const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');

const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');

loadLanguages(['pug']);

const re = /^(dist)(.*)(page-)(.*)(\.html)$/g;
const $ = cheerio.load(fs.readFileSync('build/view.html'));

let pagesTree = {
  _type: 'FOLDER'
};

function getViewPath(pagePath) {
  return pagePath.replace(re,'$1$2$4$5');
}

function getPageName(pagePath) {
  return pagePath.replace(re,'$4');
}

function getPageHref(pagePath) {
  return pagePath.replace(re,'$2$4$5');
}

function getPageFileName(pagePath) {
  return pagePath.replace(re,'$3$4$5');
}

function getPugFilePath(pagePath) {
  return pagePath.replace(re,'lib$2$3$4.pug');
}

function processPage(pagePath) {
  $('#PAGE_TITLE').text(getPageName(pagePath));
  $('#PAGE_TITLE').attr('href', getPageFileName(pagePath));
  $('#PAGE_FRAME').attr('src', getPageFileName(pagePath));

  let code = fs.readFileSync(getPugFilePath(pagePath), 'utf8');
  let hl = Prism.highlight(code, Prism.languages.pug, 'pug');

  $('#CODE').html(hl);

  $('#TREE').html(getTreeHtml(pagesTree, pagePath));

  fs.writeFileSync(getViewPath(pagePath), $.html());
}

function createPagesTree(paths) {
  paths.forEach(path => {
    let name = getPageName(path);
    let href = getPageHref(path);
    let folders = getFolderList(path);

    getFolder(folders, pagesTree)[name] = {
      _type: 'PAGE',
      _name: name,
      _href: href
    }
  })
}

function getFolderList(pagePath) {
  return pagePath.split('/').slice(1, -1);
}

function getFolder(folders, obj) {
  if (folders.length === 0) return obj;

  if (!obj[folders[0]]) obj[folders[0]] = {
    _type: 'FOLDER',
    _name: folders[0],
    _id: Math.random().toString(36).slice(2)
  };

  return getFolder(folders.slice(1), obj[folders[0]]);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getTreeHtml(pagesTree, pagePath) {
  let node = clone(pagesTree);
  let current = node;

  let pageName = getPageName(pagePath);

  getFolderList(pagePath).forEach(folder => {
    current[folder]._open = true;
    current = current[folder];
  })

  current[pageName]._selected = true;

  return getNodeHtml(node, 0);
}

function getNodeHtml(node, level) {
  let folders = [];
  let pages = [];

  for (let key in node) {
    if (key[0] !== '_') {
      switch(node[key]._type) {
        case 'FOLDER':
          folders.push(node[key]);
          break;
        case 'PAGE':
          pages.push(node[key]);
          break;
      }
    }
  }

  let newLevel = level + 1;
  let foldersHtml = folders.map(folder => `<li>${getNodeHtml(folder, newLevel)}</li>`).join('');
  let pagesHtml = pages.map(page => `<li><a style="padding-left: ${newLevel * 16}px" href="${page._href}" class="${page._selected ? 'selected' : ''}">${page._name}</a></li>`).join('');

  if (node._name) 
    return `<div><input type="checkbox" ${node._open ? 'checked ' : ''}id="${node._id}">` +
      `<label style="padding-left: ${(newLevel - 1) * 16}px" for="${node._id}">${node._name}</label>` +
      `<ul>${foldersHtml + pagesHtml}</ul></div>`;

  return `<div><ul>${foldersHtml + pagesHtml}</ul></div>`;
}

module.exports = function(cb) {
  glob('dist/**/page-*.html', (err, matches) => {
    createPagesTree(matches);

    matches.forEach(match => processPage(match));
  })

  cb();
};