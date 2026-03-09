

// 💡 전역변수
let moreData;
let res;


// 💡 데이터 불러오기
let movieData = async function () {
    moreData = JSON.parse(localStorage.moreData || null);

    // moreData(로컬스토리지)의 type(영화/tv)이 같으면~...
    if (moreData.href == 'movie') {

        // 영화
        if (moreData.name == '추천 영화') {
            res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=200`);
        } else {
            res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&sort_by=popularity.desc&with_genres=${moreData.id}`);
        }
    }
    // 같지 않으면..
    else {
        if (moreData.name == '추천 TV 프로그램') {
            // TV
            res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&without_genres=16,99,10755&vote_count.gte=200`);
        }   // 애니
        else if (moreData.name == '추천 애니메이션') {
            res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&with_genres=16&vote_count.gte=200`);
        }
        else {
            res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&sort_by=popularity.desc&with_genres=${moreData.id}`);
        }
    }
    let data = await res.json();

    popList(data);

    // 팝업을 열 때 마다 스크롤을 최상단으로 옮기기
    const el_recommendPopup = document.querySelector('.recom-popup');
    el_recommendPopup.scrollTop = 0;


}




// 💡 제목과 영화리스트 변수 만들기
let popList = function (data) {


    // 태그 이름 정하기
    const title = document.querySelector('.recom-popup .title');
    const contents = document.querySelector('.recom-popup .contents');

    // 공통 이미지 주소
    let img_repath = 'https://image.tmdb.org/t/p/w300';

    // HTML 비우기
    contents.innerHTML = '';

    // 제목 변경하기 (메인-로컬 스토리지에서 가져옴)
    title.innerHTML = moreData.name;

    // 포스터 이미지 반복문
    data.results.forEach(function (값, i) {
        let reimgs = 값.poster_path ? img_repath + 값.poster_path : '/screen/image/img_noimage.jpg'
        contents.innerHTML +=
        `<a draggable="false" class="slide" data-href="${값.id}" data-type="${moreData.href === 'movie' ? '영화' : 'TV'}"> <img draggable="false" src="${reimgs}" alt=""> </a>`;
    });
}



