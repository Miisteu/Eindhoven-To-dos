(() => {
  const STORAGE_KEY = 'eindhoven_todos_v1'

  const defaults = {
    categories: ['Kopen','Coderen/Renamen'],
    todos:[
      {id: genId(), text: 'Domein Naam kopen | €4,99 - eindhovenrp-apv.nl - [Hostinger](https://cart.hostinger.com/pay/c0da5451-81ad-4a2e-9a86-96e08b2a4ff3?_ga=GA1.1.1399628200.1767905466&_ga_73N1QWLEMH=GS2.1.s1767905466%24o1%24g1%24t1767905772%24j55%24l0%24h2037003587%24dGZYWgJv0jwMuKHcHEChiBO6s5-mHtvKZ1Q&session_id=1767905466&device_id=b6201e3b-6ea5-4f53-9e1c-d44fbf6de7b8&from=websites)', cat: 'Kopen', done:false},
      {id: genId(), text: 'FiveGuard Kopen | €125,00 - [FiveGuard](https://fiveguard.net/#pricing)', cat: 'Kopen', done:false},
      {id: genId(), text: 'EUP Key kopen | €15,57 - [CFX-Portal](https://portal.cfx.re/subscriptions/element-club)', cat: 'Kopen', done:false},
      {id: genId(), text: 'APV Website code maken/renamen', cat: 'Coderen/Renamen', done:false},
      {id: genId(), text: 'Alle Errors/Warnings in de FiveM Server wegwerken', cat: 'Coderen/Renamen', done:false}
    ]
  }

  let state = load() || defaults

  const refs = {
    todoText: document.getElementById('todoText'),
    categorySelect: document.getElementById('categorySelect'),
    addBtn: document.getElementById('addBtn'),
    newCatBtn: document.getElementById('newCatBtn'),
    todoList: document.getElementById('todoList'),
    filterSelect: document.getElementById('filterSelect'),
    searchInput: document.getElementById('searchInput')
  }

  refs.addBtn.addEventListener('click', onAdd)
  refs.newCatBtn.addEventListener('click', onNewCategory)
  refs.filterSelect.addEventListener('change', render)
  refs.searchInput.addEventListener('input', render)
  refs.todoText.addEventListener('keydown', e => { if(e.key==='Enter') onAdd() })

  populateCategories()
  render()

  function genId(){ return 'id_' + Math.random().toString(36).slice(2,9) }

  function load(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null }catch(e){return null}
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }

  function populateCategories(){
    refs.categorySelect.innerHTML = ''
    state.categories.forEach(c => {
      const o = document.createElement('option'); o.value = c; o.textContent = c; refs.categorySelect.appendChild(o)
    })
  }

  function onNewCategory(){
    const name = prompt('Nieuwe categorie naam:')
    if(!name) return
    if(state.categories.includes(name)) { alert('Categorie bestaat al'); return }
    state.categories.push(name)
    populateCategories()
    save()
  }

  function onAdd(){
    const text = refs.todoText.value.trim(); if(!text) return
    const cat = refs.categorySelect.value || state.categories[0] || 'Algemeen'
    const todo = {id: genId(), text, cat, done:false}
    state.todos.unshift(todo)
    refs.todoText.value = ''
    save(); render()
  }

  function toggleDone(id){
    const t = state.todos.find(x=>x.id===id); if(!t) return; t.done = !t.done; save(); render()
  }

  function removeTodo(id){
    if(!confirm('Verwijder deze todo?')) return
    state.todos = state.todos.filter(x=>x.id!==id); save(); render()
  }

  function parseMarkdownLinks(text){
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  }

  function render(){
    refs.todoList.innerHTML = ''
    const filter = refs.filterSelect.value
    const q = refs.searchInput.value.trim().toLowerCase()
    const list = state.todos.filter(t=>{
      if(filter==='active' && t.done) return false
      if(filter==='done' && !t.done) return false
      if(q && !(t.text.toLowerCase().includes(q) || (t.cat||'').toLowerCase().includes(q))) return false
      return true
    })

    if(list.length===0){
      const e = document.createElement('div'); e.className='todo-card'; e.textContent='Geen todos gevonden.'; refs.todoList.appendChild(e); return
    }

    list.forEach(t=>{
      const card = document.createElement('div'); card.className='todo-card'
      const left = document.createElement('div'); left.className='left'
      const cb = document.createElement('div'); cb.className = 'checkbox' + (t.done? ' done':''); cb.title = t.done ? 'Ongedaan maken' : 'Markeer als gedaan'; cb.addEventListener('click', ()=>toggleDone(t.id))
      const txt = document.createElement('div'); txt.className = 'text' + (t.done? ' done':''); txt.innerHTML = parseMarkdownLinks(t.text)
      const meta = document.createElement('div'); meta.className='meta'; const badge = document.createElement('span'); badge.className='badge'; badge.textContent = t.cat || 'Algemeen'; meta.appendChild(badge)
      left.appendChild(cb); left.appendChild(txt); left.appendChild(meta)

      const actions = document.createElement('div'); actions.className='actions'
      const del = document.createElement('button'); del.innerHTML='🗑'; del.title='Verwijder'; del.addEventListener('click', ()=>removeTodo(t.id))
      actions.appendChild(del)

      card.appendChild(left); card.appendChild(actions)
      refs.todoList.appendChild(card)
    })
  }
})();
