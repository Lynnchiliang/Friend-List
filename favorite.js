const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const lists = JSON.parse(localStorage.getItem('favoriteUsers')) || []
const LISTS_PER_PAGE = 20

let filteredLists = []
let hearthtml = ''

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const textInput = document.querySelector('#text-message')
const sendMessage = document.querySelector('#send-message')


function renderFriendList(data) {
  const likeList = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  let rawhtml = ''
  let gender = ''
  let hearthtml = `bi bi-heart`

  data.forEach((item) => {
    // showgender
    if (item.gender === "male"){
      gender = `<i class="bi bi-gender-male" style="color: #73A9D9;"></i>`
    } else {
      gender = `<i class="bi bi-gender-female" style="color: #D96262;"></i>`
    }

    //heart
    if (likeList.some(friend => friend.id === item.id)) {
      heart = 'fas'
    } else {
      heart = 'far'
    }

    rawhtml +=`
    <div class="col-sm-3">
        <div class="mb-4">
            <div class="card text-center">
              <img type="button" src="${item.avatar}" class="showAvatar rounded-circle mx-4 mt-3 shadow bg-white rounded" alt="user-avatar"  data-id="${item.id}" data-toggle="modal" data-target="#user-modal">
              <div class="card-body">
                <h6 class="card-title">${item.name} ${item.surname}</h6>
                ${gender}
              </div>
              <div class="card-footer text-center">
                <button type="button" class="btn p-0">
                  <i class="${heart} fa-heart btn-add-favorite" data-id="${item.id}"></i>
                </button>
              </div>
            </div>
          </div>
      </div>`
  })
  dataPanel.innerHTML = rawhtml
}

function showfriendlist(id) {
  const modalName = document.querySelector('#user-modal-name')
  const modalImage = document.querySelector('#user-modal-image')
  const modalRegion = document.querySelector('#user-modal-region')
  const modalDate = document.querySelector('#user-modal-date')
  const modalEmail = document.querySelector('#user-modal-email')
  const modalMessage = document.querySelector('#user-modal-message')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalName.innerHTML = `<i class="fas fa-user"></i> &nbsp ${data.name} ${data.surname}`
    modalRegion.innerHTML = `<i class="fas fa-map-marker-alt"></i> &nbsp ${data.region}`
    modalDate.innerHTML = `<i class="fas fa-birthday-cake"></i> &nbsp ${data.birthday}`
    modalEmail.innerHTML = `<i class="fas fa-envelope"></i> &nbsp ${data.email}`
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-avatar" class="rounded-circle img-fluid">`
    modalMessage.innerHTML = `<em>Send Message to ${data.name}:</em>`
  })
}

function removeFromFavorite(id) {
  if (!lists) return

  const listIndex = lists.findIndex((list) => list.id === id)
  if (listIndex === -1) return

  lists.splice(listIndex, 1)

  localStorage.setItem('favoriteUsers', JSON.stringify(lists))

  renderFriendList(lists)
}

function getListsByPage(page) {
  const data = filteredLists.length ? filteredLists : lists
  const startIndex = (page - 1) * LISTS_PER_PAGE
  return data.slice(startIndex, startIndex + LISTS_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / LISTS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  
  if(target.matches('.showAvatar')) {
    showfriendlist(target.dataset.id)
  } else if (target.matches('.btn-add-favorite')) {
    removeFromFavorite(Number(target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()
 
  filteredLists = lists.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  if (filteredLists.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的人選`)
  }
  renderPaginator(filteredLists.length)
  renderFriendList(getListsByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {

  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)

  renderFriendList(getListsByPage(page))
})

sendMessage.addEventListener('click', event => {
  const word = textInput.value.trim()
  if (!word.length) {
    textInput.classList.add('is-invalid')
  } else {
    textInput.classList.remove('is-invalid')
    alert(`\nSend Message Sucessful! \nGood Luck!`)
  }
  textInput.value = ''
})

renderPaginator(lists.length)
renderFriendList(getListsByPage(1))