(function() {
  const viewportControls = document.querySelectorAll('input[name="viewport"]');
  const treeControl = document.getElementById('TREE_CONTROL');
  const treeView = document.getElementsByClassName('tree-view')[0];
  const codeControl = document.getElementById('CODE_CONTROL');
  const codeView = document.getElementsByClassName('code-view')[0];
  const iframe = document.getElementById('PAGE_FRAME');

  changeViewport(getViewport());
  toggleTree(getTree());
  toggleCode(getCode());

  for (let i = 0; i < viewportControls.length; i++) {
    setupViewportControl(viewportControls[i]);
  }

  codeControl.addEventListener('change', () => {
    toggleCode(!getCode())
  });

  treeControl.addEventListener('change', () => {
    toggleTree(!getTree())
  });

  document.getElementsByClassName('content')[0].setAttribute('style', '');

  function setupViewportControl(control) {
    control.addEventListener('change', () => {
      changeViewport(control.value);
    });
  };

  function changeViewport(value) {
    localStorage.setItem('viewport', value);
    document.querySelector(`input[value="${value}"]`).checked = true;
    iframe.setAttribute('class', value);
  }

  function toggleTree(value) {
    treeControl.checked = value;
    treeView.classList.toggle('visible', value);
    localStorage.setItem('tree', value);
  }

  function toggleCode(value) {
    codeControl.checked = value;
    codeView.classList.toggle('visible', value);
    localStorage.setItem('code', value);
  }

  function getTree() {
    return localStorage.getItem('tree') === 'true' ? true : false;
  }

  function getCode() {
    return localStorage.getItem('code') === 'true' ? true : false;
  }

  function getViewport() {
    return localStorage.getItem('viewport') || 'xs';
  }
})();