const el_listTitle = document.querySelector('.sort-tab h2');
const el_sortBtn = document.querySelectorAll('.sort-btn a');
const el_list = document.querySelector('.curation .list');
const el_more = document.querySelector('.curation .more');
const el_genreWrap = document.querySelector('.genre-btn');
const el_listBackImg = document.querySelector('.back-img');

let searchType = new URLSearchParams(document.location.search);
let type = searchType.get("type");

let img_pathOG = 'https://image.tmdb.org/t/p/original';
let img_path = 'https://image.tmdb.org/t/p/w500';
let currentSort = 'popularity'; // 기본값
let mvPage = 1;                 // 영화 페이지
let tvPage = 1;                 // TV 페이지
let selectedGenres = [];        // 클릭해서 선택한 장르
let selectedOTT = [];           // 클릭해서 선택한 OTT




const el_navTab = document.querySelectorAll('nav a');

if (type == 'movie') {
    el_navTab.forEach(function (a, i) {
        a.classList.remove('active2');
    });
    el_navTab[0].classList.add('active2');
} else {
    el_navTab.forEach(function (a, i) {
        a.classList.remove('active2');
    });
    el_navTab[1].classList.add('active2');
}



/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                     순서 정렬
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* sort 버튼 토글 함수 */
let sort_btn_toggle = function (btn) {
    el_sortBtn.forEach(function (b) {
        b.classList.remove('active');
    });

    btn.classList.add('active');
};

/* sort 버튼 이벤트 */
el_sortBtn.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
        sort_btn_toggle(btn);

        currentSort = btn.dataset.sort;

        mvPage = 1;                   // 페이지 초기화
        tvPage = 1;                   // 페이지 초기화
        el_list.innerHTML = '';     // 리스트 초기화

        type == 'movie' ? movieListfetch(mvPage) : tvListfetch(tvPage);
    });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                     사이드 메뉴
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* side menu 펼치기 */
const el_spr = document.querySelectorAll('.spr');
const el_spread = document.querySelectorAll('.spr .spread');

el_spread.forEach(function (sp, i) {
    sp.addEventListener('click', function () {
        el_spr[i].classList.toggle('active');
    });
});

/* OTT 버튼 필터 */
const el_ottIc = document.querySelectorAll('.icons a');

el_ottIc.forEach(function (btn) {
    btn.addEventListener('click', function () {

        const id = Number(btn.dataset.id);

        btn.classList.toggle('active');

        if (selectedOTT.includes(id)) {
            selectedOTT = selectedOTT.filter(o => o !== id);
        } else {
            selectedOTT.push(id);
        }

        mvPage = 1;
        tvPage = 1;
        el_list.innerHTML = '';

        if (type == 'movie') {
            movieListfetch(mvPage);
        } else {
            tvListfetch(tvPage);
        }
    });
});


/* 영화 장르 버튼 출력 */
let mvGenBtnOutFun = function () {
    let mg = JSON.parse(localStorage.moviesGenres);

    el_genreWrap.innerHTML = '';

    mg.forEach(function (g, i) {
        el_genreWrap.innerHTML += `<a class="genBtn" data-id="${g.id}">${g.name}</a>`;
    });
};


/* TV 장르 버튼 출력 */
let tvGenBtnOutFun = function () {
    let tg = JSON.parse(localStorage.tvGenres);

    el_genreWrap.innerHTML = '';

    tg.forEach(function (g, i) {
        el_genreWrap.innerHTML += `<a class="genBtn" data-id="${g.id}">${g.name}</a>`;
    });
};


/* 장르 버튼 필터 */
el_genreWrap.addEventListener('click', function (e) {
    if (e.target.classList.contains('genBtn')) {

        const id = Number(e.target.dataset.id);

        e.target.classList.toggle('active');

        if (selectedGenres.includes(id)) {
            // 이미 선택된 상태 -> 제거
            selectedGenres = selectedGenres.filter(function (g) {
                return g !== id;
            });
        } else {
            // 선택 안된 상태 -> 추가
            selectedGenres.push(id);
        }

        // 페이지 초기화
        mvPage = 1;
        tvPage = 1;
        el_list.innerHTML = '';

        type == 'movie' ? movieListfetch(mvPage) : tvListfetch(tvPage);
    }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                        영화
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 영화 데이터 불러오기 */
let movieListfetch = async function (mvPage) {
    /* 오늘 날짜 생성 */
    const today = new Date().toISOString().split("T")[0];

    let sortQuery = '';

    if (currentSort === 'popularity') {     // 인기순
        sortQuery = 'sort_by=popularity.desc';
    }
    else if (currentSort === 'rating') {    // 평점순
        sortQuery = 'sort_by=vote_average.desc&vote_count.gte=100';
    }
    else if (currentSort === 'latest') {    // 최근작품순
        sortQuery = `sort_by=release_date.desc&release_date.lte=${today}`;
    }

    let res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&watch_region=KR&${sortQuery}&page=${mvPage}&with_genres=${selectedGenres.join(',')}&with_watch_providers=${selectedOTT.join('|')}`);
    let data = await res.json();

    movieListOutput(data.results);

    let validItem = data.results.find(item => item.backdrop_path !== null);

    if (validItem) {
        let backImg = img_pathOG + validItem.backdrop_path;
        el_listBackImg.innerHTML = `<img draggable="false" src="${backImg}">`;
    }
};

/* 영화 리스트 출력 */
let movieListOutput = function (movies) {

    movies.slice(0, 20).forEach(function (mov, i) {

        let year = mov.release_date.split('-')[0];  // 날짜 년도만 끊어서 저장

        /* 장르id -> 장르이름 변경 후 배열에 저장 */
        let mvGen = JSON.parse(localStorage.moviesGenres);
        let genre = [];

        mvGen.forEach(function (gen, i) {
            if (mov.genre_ids.includes(gen.id)) {
                genre.push(gen.name);
            }
        });

        /* 출력 */
        let noImg = '/screen/image/img_noimage.jpg';

        el_list.innerHTML +=
            `<figure class="slide click-area" data-href="${mov.id}" data-type="영화">
                <p class="poster"><img draggable="false" src="${mov.poster_path == null ? noImg : img_path + mov.poster_path}" alt="영화포스터"></p>
                <div class="objs-txt">
                    <p class="name">${mov.title}</p>
                    <p>${year} · ${genre.join(' / ')}</p>
                    <p>${mov.vote_average.toFixed(1)}</p>
                </div>
            </figure>`;
    });

};

/* more 버튼 */
let movieMoreFun = function () {
    el_more.addEventListener('click', function () {
        mvPage++;
        movieListfetch(mvPage);
    });
};


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                        TV
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* TV 데이터 불러오기 */
let tvListfetch = async function (mvPage) {
    /* 오늘 날짜 생성 */
    const today = new Date().toISOString().split("T")[0];

    let sortQuery = '';

    if (currentSort === 'popularity') {     // 인기순
        sortQuery = 'sort_by=popularity.desc';
    }
    else if (currentSort === 'rating') {    // 평점순
        sortQuery = 'sort_by=vote_average.desc&vote_count.gte=100';
    }
    else if (currentSort === 'latest') {    // 최근작품순
        sortQuery = `sort_by=first_air_date.desc&first_air_date.lte=${today}`;
    }

    let res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&watch_region=KR&${sortQuery}&page=${mvPage}&with_genres=${selectedGenres.join(',')}&with_watch_providers=${selectedOTT.join('|')}`);
    let data = await res.json();

    tvListOutput(data.results);

    /* 상단 이미지 출력 */
    let validItem = data.results.find(item => item.backdrop_path !== null);     // backdrop_path가 null이 아닌것을 찾음

    if (validItem) {        // backdrop_path가 존재한다면 조건문 실행
        let backImg = img_pathOG + validItem.backdrop_path;
        el_listBackImg.innerHTML = `<img draggable="false" src="${backImg}">`;
    }
};

/* TV 리스트 출력 */
let tvListOutput = function (tv) {

    tv.slice(0, 20).forEach(function (t, i) {

        let year = t.first_air_date.split('-')[0];  // 날짜 년도만 끊어서 저장

        /* 장르id -> 장르이름 변경 후 배열에 저장 */
        let tvGen = JSON.parse(localStorage.tvGenres);
        let genre = [];

        tvGen.forEach(function (gen, i) {
            if (t.genre_ids.includes(gen.id)) {
                genre.push(gen.name);
            }
        });

        /* 출력 */
        let noImg = '/screen/image/img_noimage.jpg';

        el_list.innerHTML +=
            `<figure class="slide click-area" data-href="${t.id}" data-type="TV">
                <p class="poster"><img draggable="false" src="${t.poster_path == null ? noImg : img_path + t.poster_path}" alt="영화포스터"></p>
                <div class="objs-txt">
                    <p class="name">${t.name}</p>
                    <p>${year} · ${genre.join(' / ')}</p>
                    <p>${t.vote_average.toFixed(1)}</p>
                </div>
            </figure>`;
    });
};

/* more 버튼 */
let tvMoreFun = function () {
    el_more.addEventListener('click', function () {
        tvPage++;
        tvListfetch(tvPage);
    });
};



/* 영화, TV 리스트 구분 */
if (type == 'movie') {
    movieListfetch(mvPage);
    movieMoreFun();
    mvGenBtnOutFun();
} else {
    tvListfetch(tvPage);
    tvMoreFun();
    tvGenBtnOutFun();
}

/* 영화 / TV 타이틀 변경 */
el_listTitle.innerText = type == 'movie' ? '영화' : 'TV 프로그램';