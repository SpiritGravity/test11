import './sass/main.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
// import { axiosPixabay } from './js/axiosPixabay';
// console.log(axiosPixabay)
// import * as axiosPixabay from './js/axiosPixabay'
// console.log(axiosPixabay)
import ImageApiService from './js/axiosPixabay';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    form: document.querySelector('#search-form'),
    submitBtn: document.querySelector('#search-form button'),
    galleryRef: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    goUpBtn: document.querySelector('.go-up'),
};

refs.form.style =
    'background-color: #4056b9; display: flex; justify-content: center; padding: 9px; margin-bottom: 9px; position: fixed; top: 0; z-index: 99; width: 100%';
refs.submitBtn.style = 'margin-left: 32px';
refs.loadMoreBtn.style = ' display: none';
refs.goUpBtn.style = ' display: none';


refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);
refs.goUpBtn.addEventListener('click', onButtonUp);

const imageApiService = new ImageApiService();
function createImageEl(hits) {
    console.log(hits);
    const markup = hits
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
            <a href="${largeImageURL}" class="photo-card">
             <img src="${webformatURL}" alt="${tags}" loading = "lazy"  class="photo-image" />
             <div class="info" style= "display: flex">
                <p class="info-item">
                   <b>Likes:</b>${likes}
                </p>
                <p class="info-item">
                  <b>Views: </b>${views}
                </p>
                <p class="info-item">
                  <b>Comments: </b>${comments}
                </p>
                <p class="info-item">
                  <b>Downloads: </b>${downloads}
                </p>
              </div>
               </a> `;
            })
            .join('');
          refs.galleryRef.insertAdjacentHTML('beforeend', markup);
          simpleLightbox();
          scroll();
          refs.loadMoreBtn.style =
          ' display: flex;  margin-left: auto;  margin-right: auto; margin-bottom:32px; margin-top:32px; padding:16px; border: 1px solid green; border-radius:8px; background-color: yellow';
        refs.goUpBtn.style =
          'position: fixed; bottom: 32px;right: 32px; border-radius: 50%; width: 80px; height: 80px; background-color: lime; color: blue; border: 1px solid blue';
      }
      async function onSubmit(e) {
        e.preventDefault();
        imageApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
        console.log(imageApiService.searchQuery);
        imageApiService.resetPage();
        try {
          if (imageApiService.searchQuery === '') {
            clearImagesContainer();
            Notify.warning('Enter your search query');
          } else {
            const response = await imageApiService.fetchPhotos();
            const {
              data: { hits, total, totalHits },
            } = response;
            clearImagesContainer();
            if (hits.length === 0) {
              Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            } else {
            Notify.success(`Hooray! We found ${totalHits} images.`);
            createImageEl(hits);
            }
        }
        } catch (error) {
        Notify.failure("We're sorry, but you've reached the end of search results.");
        console.log(error.message);
        }
    }
    async function onLoadMoreClick(e) {
        e.preventDefault();
        const response = await imageApiService.fetchPhotos();
        const {
        data: { hits },
        } = response;
        if (hits.length === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else createImageEl(hits);
    }
    function clearImagesContainer() {
        refs.galleryRef.innerHTML = '';
        refs.loadMoreBtn.style = 'display: none';
        refs.goUpBtn.style = ' display: none';
    }
    function scroll() {
        const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
        window.scrollBy({
        top: cardHeight * 1,
        behavior: 'smooth',
        });
    }

    function simpleLightbox() {
        let lightbox = new SimpleLightbox('.gallery a', {
        });
        lightbox.refresh();
    }
    function onButtonUp(e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    }
