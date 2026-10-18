const toast = document.querySelector('#copy-status')
let toastTimer
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy)
      toast.textContent = 'Copied to your clipboard.'
    }
    catch {
      toast.textContent = 'Copy unavailable. Select the text and use your copy shortcut.'
    }
    toast.classList.add('is-visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000)
  })
})

const runDemo = document.querySelector('#run-demo')
const demoOutput = document.querySelector('#demo-output')
const clipboard = document.querySelector('#clipboard-value')
function previewSelection(text) {
  clipboard.textContent = text
  document.querySelector('.clipboard-preview').classList.add('has-selection')
  document.querySelector('#clipboard-check').textContent = '✓'
}
runDemo?.addEventListener('click', () => {
  document.querySelector('#demo-sample').classList.toggle('is-selected')
  const selected = document.querySelector('#demo-sample').classList.contains('is-selected')
  if (selected) {
    previewSelection(document.querySelector('#demo-sample').textContent)
    runDemo.innerHTML = 'Reset the demo <span aria-hidden="true">↺</span>'
  }
  else {
    clipboard.textContent = 'Your selection goes here.'
    document.querySelector('.clipboard-preview').classList.remove('has-selection')
    document.querySelector('#clipboard-check').textContent = '↵'
    runDemo.innerHTML = 'Try the demo <span aria-hidden="true">↗</span>'
  }
})
function handleSelection() {
  const selection = window.getSelection()
  if (selection && demoOutput.contains(selection.anchorNode) && demoOutput.contains(selection.focusNode) && selection.toString().trim())
    previewSelection(selection.toString().trim())
}
demoOutput?.addEventListener('pointerup', handleSelection)
demoOutput?.addEventListener('keyup', handleSelection)

const search = document.querySelector('#faq-search')
search?.addEventListener('input', () => {
  const query = search.value.toLocaleLowerCase().trim()
  let count = 0
  document.querySelectorAll('[data-faq]').forEach((item) => {
    const matches = item.textContent.toLocaleLowerCase().includes(query)
    item.hidden = !matches
    if (matches) count++
  })
  document.querySelector('#no-results').hidden = count > 0
  document.querySelector('#faq-count').textContent = `${count} answers found.`
})
