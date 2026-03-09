/* movie 장르 로컬스토리지 저장 */
let moviesGenresFun = async function () {
    let res = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=ko-KR&api_key=a3a99689753df933ab4c76e497b6c0b7');
    let data = await res.json();

    localStorage.moviesGenres = JSON.stringify(data.genres);
};

/* tv 장르 로컬스토리지 저장 */
let tvGenresFun = async function () {
    let res = await fetch('https://api.themoviedb.org/3/genre/tv/list?language=ko-KR&api_key=a3a99689753df933ab4c76e497b6c0b7');
    let data = await res.json();

    localStorage.tvGenres = JSON.stringify(data.genres);
};




// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                        개봉예정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const el_mainVideo = document.querySelector('.video-wrap iframe');
const el_subVideo = document.querySelectorAll('.video a');
const el_thumb = document.querySelectorAll('.video .thumb img');
const el_thumbName = document.querySelectorAll('.video .name');

const el_soonName = document.querySelector('.main-top .name');

/* 데이터 호출 */
let soonCallFun = async function () {
    let soonRes = await fetch('https://api.themoviedb.org/3/movie/upcoming?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR');
    let soonData = await soonRes.json();

    let img_path = 'https://image.tmdb.org/t/p/w300';

    let videoCount = 0;             // 영상 들어간 개수 체크

    for (let i = 0; i < soonData.results.length; i++) {

        if (videoCount >= 4) break; // 4개 채우면 종료

        let soon = soonData.results[i];

        let detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${soon.id}/videos?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR`);
        let detailsData = await detailsRes.json();

        /* 영상이 없으면 넘어가기 */
        if (!detailsData.results || detailsData.results.length === 0) {
            continue;
        }

        let videoKey = detailsData.results[0].key;

        let youtubeLink = `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&loop=1&playlist=${videoKey}&controls=0`;

        el_thumbName[videoCount].innerText = soon.title;
        el_thumb[videoCount].src = img_path + soon.backdrop_path;
        el_subVideo[videoCount].href = youtubeLink;

        if (videoCount === 0) {
            el_mainVideo.src = youtubeLink;
        }

        videoCount++;
    }
};



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                         TOP 10
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const el_topTabBtn = document.querySelectorAll('.top-tab button');
const el_topContents = document.querySelectorAll('.top-contents');
const el_topMovies = document.querySelector('.top-movies');
const el_topTv = document.querySelector('.top-tv');

/* 버튼 토글 함수 */
let top_btn_toggle = function (btn) {
    el_topTabBtn.forEach(function (b) {
        b.classList.remove('active');
    });

    btn.classList.add('active');
};

/* 버튼에 해당하는 컨텐츠 변경 함수 */
let top_change = function (i) {
    el_topContents.forEach(function (con, j) {
        con.classList.remove('active');
    });

    el_topContents[i].classList.add('active');
};

/* 탭 버튼 이벤트 */
el_topTabBtn.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
        top_btn_toggle(btn);
        top_change(i);
    });
});

const el_topMovieOutput = document.querySelector('.top-movies .top10');
const el_topTvOutput = document.querySelector('.top-tv .top10');

/* popular 영화, tv 데이터 호출 */
let topCallFun = async function () {
    let moviesRes = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc');
    let moviesData = await moviesRes.json();

    let tvRes = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=popularity.desc');
    let tvData = await tvRes.json();

    top10DomControl(moviesData.results, tvData.results);
};

/* dom 출력 */
let top10DomControl = function (movie, tv) {
    let img_path = 'https://image.tmdb.org/t/p/w300';

    el_topMovieOutput.innerHTML = '';
    el_topTvOutput.innerHTML = '';

    movie.slice(0, 10).forEach(function (mov, i) {
        el_topMovieOutput.innerHTML +=
            `<a data-href="${mov.id}" data-type="영화" class="slide ${i === 9 ? 'last' : ''}" draggable="false">
                <span ${i === 9 ? 'class="ten"' : ''}>${i + 1}</span>
                <p class="img-wrap"><img src="${img_path + mov.poster_path}" draggable="false"></p>
            </a>`;
    });

    tv.slice(0, 10).forEach(function (t, i) {
        el_topTvOutput.innerHTML +=
            `<a data-href="${t.id}" data-type="TV" class="slide ${i === 9 ? 'last' : ''}" draggable="false">
                <span ${i === 9 ? 'class="ten"' : ''}>${i + 1}</span>
                <p class="img-wrap"><img src="${img_path + t.poster_path}" draggable="false"></p>
            </a>`;
    });
};



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                          추천목록
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const el_recommendTabBtn = document.querySelectorAll('.recommend-tab button');
const el_recommendContents = document.querySelectorAll('.recommend-contents');
const el_recommendAll = document.querySelector('.recommend-all');
const el_recommendMovies = document.querySelector('.recommend-movies');
const el_recommendTv = document.querySelector('.recommend-tv');

/* 버튼 토글 함수 */
let recommend_btn_toggle = function (btn) {
    el_recommendTabBtn.forEach(function (b) {
        b.classList.remove('active');
    });

    btn.classList.add('active');
};

/* 버튼에 해당하는 컨텐츠 변경 함수 */
let recommend_change = function (i) {
    el_recommendContents.forEach(function (con, j) {
        con.classList.remove('active');
    });

    el_recommendContents[i].classList.add('active');
};

/* 탭 버튼 이벤트 */
el_recommendTabBtn.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
        recommend_btn_toggle(btn);
        recommend_change(i);
        recommendMoviesRandom();
        recommendTvRandom();
    });
});




const el_recomMovieOutput = document.querySelector('.mov');
const el_recomdTvOutput = document.querySelector('.tvpro');
const el_recomAniOutput = document.querySelector('.animation');

/* top rated 데이터 호출 */
let recommendCallFun = async function () {
    let movieRes = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=200');
    let movieData = await movieRes.json();

    let tvRes = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&without_genres=16,99,10755&vote_count.gte=200');
    let tvData = await tvRes.json();

    let aniRes = await fetch('https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&include_adult=false&include_video=false&language=ko-KR&page=1&sort_by=vote_average.desc&with_genres=16&vote_count.gte=200');
    let aniData = await aniRes.json();

    recommendDomControl(movieData.results, tvData.results, aniData.results);
};
// 공통 주소
let img_path = 'https://image.tmdb.org/t/p/w200';

/* dom 출력 */
let recommendDomControl = function (movie, tv, ani) {

    el_recomMovieOutput.innerHTML = '';
    el_recomdTvOutput.innerHTML = '';
    el_recomAniOutput.innerHTML = '';

    movie.slice(0, 16).forEach(function (mov, i) {
        let img_onOFF = mov.poster_path ? img_path + mov.poster_path : '/screen/image/img_noimage.jpg';
        el_recomMovieOutput.innerHTML +=
            `<a data-href="${mov.id}"  data-type="영화" class="slide" draggable="false">
                <img src="${img_onOFF}" draggable="false">
            </a>`;
    });
    tv.slice(0, 16).forEach(function (t, i) {
        let img_onOFF = t.poster_path ? img_path + t.poster_path : '/screen/image/img_noimage.jpg';
        el_recomdTvOutput.innerHTML +=
            `<a data-href="${t.id}" data-type="TV" class="slide" draggable="false">
                <img src="${img_onOFF}" draggable="false">
            </a>`;
    });
    ani.slice(0, 16).forEach(function (an, i) {
        let img_onOFF = an.poster_path ? img_path + an.poster_path : '/screen/image/img_noimage.jpg';
        el_recomAniOutput.innerHTML +=
            `<a data-href="${an.id}" data-type="애니메이션" class="slide" draggable="false">
                <img src="${img_onOFF}" draggable="false">
            </a>`;
    });
};

/* movie 랜덤 장르 3개 뽑기 */
let getRndMoviesGenres = function () {
    let genres = JSON.parse(localStorage.moviesGenres);
    let shuffled = genres.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

/* movie 랜덤 장르 기반 출력 */
let recommendMoviesRandom = async function () {
    let container = document.querySelector('.recommend-movies');
    container.innerHTML = '';

    let randomGenres = getRndMoviesGenres();

    for (let genre of randomGenres) {
        let res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&sort_by=popularity.desc&with_genres=${genre.id}`);
        let data = await res.json();

        let html =
            `<article>
                <div class="main-title">
                    <h2>${genre.name}</h2>
                    <a href="movie" class="more" data-name="${genre.name}" data-id="${genre.id}" draggable="false">더보기<img src="./image/ic_right.svg"></a>
                    </div>
                    <div class="swiper wrapper drag-area">`;

        data.results.slice(0, 16).forEach(function (movie) {
            let img_onOFF = movie.poster_path ? img_path + movie.poster_path : '/screen/image/img_noimage.jpg';
            html +=
                `<a data-href="${movie.id}" data-type="영화" class="slide" draggable="false">
                    <img src="${img_onOFF}" draggable="false">
                </a>`;
        });

        html += `</div></article>`;

        container.innerHTML += html;
    }
    dragFunc2();
};

/* tv 랜덤 장르 3개 뽑기 */
let getRndTvGenres = function () {
    let genres = JSON.parse(localStorage.tvGenres);
    let shuffled = genres.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

/* tv 랜덤 장르 기반 출력 */
let recommendTvRandom = async function () {
    let container = document.querySelector('.recommend-tv');
    container.innerHTML = '';

    let randomGenres = getRndTvGenres();

    for (let genre of randomGenres) {
        let res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&sort_by=popularity.desc&with_genres=${genre.id}`);
        let data = await res.json();

        let html =
            `<article>
        <div class="main-title">
        <h2>${genre.name}</h2>
        <a href="tv" class="more" data-name="${genre.name}" data-id="${genre.id}">더보기<img src="/screen/image/ic_right.svg"></a>
                </div>
                <div class="swiper wrapper drag-area">`;

        data.results.slice(0, 16).forEach(function (tv) {
            let img_onOFF = tv.poster_path ? img_path + tv.poster_path : '/screen/image/img_noimage.jpg';
            html +=
                `<a data-href="${tv.id}" data-type="TV" class="slide" draggable="false">
                    <img src="${img_onOFF}" draggable="false">
                </a>`;
        });

        html += `</div></article>`;

        container.innerHTML += html;
    }
    dragFunc2();
};



let init = async function () {
    await moviesGenresFun();
    await tvGenresFun();

    topCallFun();
    recommendCallFun();

    soonCallFun();

    // recommendList팝업 출력 (현주)
    $(document).on('click', '.more', function (e) {

        // 새로고침 안되게
        e.preventDefault();

        // let _target = e.target.tagName == 'A' ? e.target : e.target.parentElement;
        let href = this.getAttribute('href');
        let name = this.getAttribute('data-name');
        let id = this.getAttribute('data-id');

        if (name) {
            // 메인페이지에 있는 로컬스토리지에서 moreData를 가져와서 사용하기
            localStorage.moreData = JSON.stringify({ 'href': href, 'name': name, 'id': id });
            movieData();

            // 팝업 열기
            $('.recom-popup-wrap').css('display', 'flex');

            // 팝업 닫기
            $('.recom-popup-wrap').on('click', '.recom-btn-x', function () {
                $('.recom-popup-wrap').css('display', 'none');

                $('body').css('overflow', 'auto'); /* 스크롤 다시 생기게 */
            });

            $('body').css('overflow', 'hidden'); /* 팝업 열면 배경스크롤 없애줘 */
        }
    })

    $('body').append('<div class="recom-popup-wrap">  </div>');
    $('.recom-popup-wrap').load('/screen/pages/popup-recommendList.html');

};
init();


/* 드래그 스크롤 */
let dragFunc2 = function () {
    const slider = document.querySelectorAll('.drag-area');

    let isDragging = false;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.forEach(function (sli, i) {
        sli.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false; // 초기화
            sli.classList.add('active');
            startX = e.pageX - sli.offsetLeft;
            scrollLeft = sli.scrollLeft;
        });

        sli.addEventListener('mouseleave', () => {
            isDown = false;
        });

        sli.addEventListener('mouseup', () => {
            isDown = false;
        });

        sli.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - sli.offsetLeft;
            const walk = (x - startX) * 1; // 드래그 속도 조절

            if (Math.abs(walk) > 5) {
                isDragging = true;
            }

            sli.scrollLeft = scrollLeft - walk;
        });

        sli.addEventListener('click', function (e) {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // document.addEventListener('wheel', function (e) {

    //     const slider = e.target.closest('.drag-area');
    //     if (!slider) return;

    //     if (slider.scrollWidth > slider.clientWidth) {
    //         e.preventDefault();
    //         slider.scrollLeft += e.deltaY;
    //     }

    // }, { passive: false });
}
