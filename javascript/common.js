const el_header = document.querySelector('header');
const el_nav = document.querySelector('.header-left nav');
const el_headerIcon = document.querySelector('header .header-icon');
const el_headerSearch = document.querySelector('.header-search');

/* 헤더 검색창 펼침 */
if (el_headerIcon) {
    el_headerIcon.addEventListener('click', function () {
        el_header.classList.toggle('active');
        el_nav.classList.toggle('active');
        el_headerSearch.classList.toggle('active');
        el_headerIcon.classList.toggle('active');

        let contains = el_headerIcon.classList.contains('active');
        if (contains) {
            el_headerIcon.innerHTML = `<img draggable="false" src="/screen/image/ic_x.svg" alt="검색아이콘">`;
        } else {
            el_headerIcon.innerHTML = `<img draggable="false" src="/screen/image/ic_search.svg" alt="검색아이콘">`;
        }
    });
}
/* 헤더 추천검색어 */
let headerRecommendFun = async function () {
    const el_recommendSearchKeyword = document.querySelector('.header-search .recommend div');
    el_recommendSearchKeyword.innerHTML = '';

    let res = await fetch('https://api.themoviedb.org/3/trending/all/day?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR');
    let data = await res.json();

    data.results.slice(0, 3).forEach(item => {
        let title = item.title || item.name;
        el_recommendSearchKeyword.innerHTML += `<a draggable="false" href="/screen/pages/sub-search.html?keyword=${title}">${title}</a>`;
    });
};
headerRecommendFun();


/* 검색창 미입력시 실행 alert */
window.addEventListener('submit', function (e) {
    e.preventDefault();
    const headerSearch = this.document.querySelector('.header-search-box');
    const headerSearchInput = this.document.querySelector('.header-search-box input');

    if (headerSearchInput.value == '') {
        alert("검색어를 입력해주세요!");
    }
    else {
        headerSearch.submit();
    }
})



// let params = new URLSearchParams(document.location.search);
// let keyword = params.get("keyword");


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                          인물 팝업 (이태현)
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* 필모 스크립트 함수 */
let popup_filmography_func = function (id) {
    const img_path200 = 'https://image.tmdb.org/t/p/w200';
    let filmoNum = 20;      // 필모 초기 출력 갯수

    /* 인물 프로필 출력 함수 */
    let profileOutputFunc = function (detailData, IdsData) {
        const el_filmoProfileImg = document.querySelector('.profile .image');
        const el_filmoName = document.querySelector('.profile .details .name');
        const el_filmoJop = document.querySelector('.profile .details .name');
        const el_genderBirth = document.querySelector('.profile .details .genderBirth');
        const el_filmoIcs = document.querySelectorAll('.profile .details .icons a');

        let gender = detailData.gender == 2 ? '남' : '여';
        let bir = detailData.birthday;
        let [year, month, day] = bir.split('-');
        let birthday = `${year}년 ${month}월 ${day}일`;
        let homeURL = detailData.homepage;
        let instaURL = `https://instagram.com/${IdsData.instagram_id}`;

        el_filmoName.innerHTML = '';
        el_filmoJop.innerHTML = '';

        // 프로필 사진
        el_filmoProfileImg.innerHTML = `<img draggable="false" src="${img_path200 + detailData.profile_path}">`;
        // 이름
        el_filmoName.innerHTML += `<h2>${detailData.name}</h2>`;
        // 전문분야(직업)
        el_filmoJop.innerHTML += `<p>${detailData.known_for_department}</p  >`;
        // 성별, 출생
        el_genderBirth.innerHTML = `
            <p><b>성별</b> : ${gender}</p>
            <p><b>출생</b> : ${birthday}</p>`;
        // 아이콘 링크
        el_filmoIcs[0].setAttribute("href", `${instaURL}`);
        el_filmoIcs[1].setAttribute("href", `${homeURL}`);
    };

    /* 대표작 출력 함수 */
    let castOutputFunc = function (allCredits) {
        const el_filmoPosterWrap = document.querySelector('.appear .posters');
        const el_filmoPosters = document.querySelectorAll('.appear .posters a');
        const noImg = '/screen/image/img_noimage.jpg';

        el_filmoPosterWrap.innerHTML = '';

        allCredits.slice(0, 12).forEach(function (ca, i) {
            let posterImg = img_path200 + ca.poster_path;

            el_filmoPosterWrap.innerHTML += `<a draggable="false" class="po slide" data-href="${ca.id}" data-type="${ca.media_type == 'movie' ? '영화' : 'TV'}"><img draggable="false" src="${ca.poster_path ? posterImg : noImg}"></a>`;

            el_filmoPosters.forEach(function (poster, i) {
                poster.addEventListener('click', function () {
                    document.body.classList.remove('popup-open');
                    document.querySelector('#popup-filmography').remove();      // 대표작 클릭하면 인물팝업 삭제
                });
            });
        });

        dragFunc1();
    };

    /* 필모 출력 함수 */
    let filmoOutputFunc = function (allCredits) {
        const el_filmoText = document.querySelector('.filmo .box');

        el_filmoText.innerHTML = '';



        /* 날짜 있는 것만 최신순으로 영화, TV 모두 필터링해서 sorted에 저장 */
        let sorted = allCredits
            .filter(ca => ca.release_date || ca.first_credit_air_date)     // 영화일때 TV일때 날짜 둘 다
            .sort((a, b) => {
                let dateA = a.release_date || a.first_credit_air_date;
                let dateB = b.release_date || b.first_credit_air_date;
                return new Date(dateB) - new Date(dateA);           // 최신순 정렬
            })
            .slice(0, filmoNum);

        let prevYear = 0;                                           // 이전 년도

        sorted.forEach(function (ca, i) {
            let date = ca.release_date || ca.first_credit_air_date;        // 영화일때 TV일때 날짜 둘 다
            if (!date) return;

            let year = date.split('-')[0];                          // 연도만 저장

            /* 연도가 바뀌면 line 추가 */
            if (prevYear != year) {
                el_filmoText.innerHTML += `<div class="line"></div>`;
            }

            let title = ca.title || ca.name;                        // 영화일때 TV일때 제목 둘 다

            el_filmoText.innerHTML += `
            <div class="details">
                <p class="year">${year}</p>
                <div class="text slide" data-href="${ca.id}" data-type="${ca.media_type == 'movie' ? '영화' : 'TV'}">
                    <a draggable="false">${title}</a>
                    <p>${ca.character || ca.job || '정보 없음'}</p>
                </div>
            </div>`;                                            // ca.character || '' : 역할이 값이 없는경우 ''출력

            prevYear = year;                                        // 이번 횟수의 년도 전 년도에 저장

        });
        const el_filmoTitle = document.querySelectorAll('.filmo .slide');

        el_filmoTitle.forEach(function (title, i) {

            title.addEventListener('click', function () {
                document.body.classList.remove('popup-open');
                document.querySelector('#popup-filmography').remove();
            });
        });
    };

    /* More 버튼 함수 */
    let moreFunc = function (allCredits) {
        const el_filmoMore = document.querySelector('.filmo .more');

        /* 날짜 있는 데이터만 필터 */
        let filtered = allCredits
            .filter(ca => ca.release_date || ca.first_credit_air_date)     // 영화일때 TV일때 날짜 둘 다
            .sort((a, b) => {
                let dateA = a.release_date || a.first_credit_air_date;
                let dateB = b.release_date || b.first_credit_air_date;
                return new Date(dateB) - new Date(dateA);           // 최신순 정렬
            });

        filmoOutputFunc(allCredits);                      // 최초 출력

        /* 버튼 표시 여부 체크 함수 */
        let checkMoreBtn = function () {
            if (filmoNum >= filtered.length) {          // 정보가 없다면
                el_filmoMore.style.display = 'none';    // 버튼 안보이게
            } else {
                el_filmoMore.style.display = 'flex';
            }
        };

        checkMoreBtn();  // 처음부터 부족하면 숨김

        /* More 버튼 이벤트 */
        el_filmoMore.addEventListener('click', function () {
            filmoNum += 10;                 // 누르면 10개씩 늘어나게
            filmoOutputFunc(allCredits);      // 출력
            checkMoreBtn();                 // 더 이상 정보가 없어서 버튼을 없앨지 체크
        });
    };

    /* 인물 데이터들 불러오기 */
    let personDataFunc = async function (id) {
        const defaultURL = 'https://api.themoviedb.org/3';
        const APIkey = 'a3a99689753df933ab4c76e497b6c0b7';

        // let id = 10980;

        /* 인물 상세 정보 */
        let detailRes = await fetch(`${defaultURL}/person/${id}?api_key=${APIkey}&language=ko-KR`);
        let detailData = await detailRes.json();

        /* 인물의 ID들 정보 */
        let IdsDataRes = await fetch(`${defaultURL}/person/${id}/external_ids?api_key=${APIkey}`);
        let IdsData = await IdsDataRes.json();

        /* 인물 출연 정보 */
        let castRes = await fetch(`${defaultURL}/person/${id}/combined_credits?api_key=${APIkey}&language=ko-KR`);
        let castData = await castRes.json();

        let allCredits = [...castData.cast, ...castData.crew];

        allCredits.sort(function (a, b) {
            return b.popularity - a.popularity;
        });

        let uniqueCredits = [];
        let ids = new Set();

        allCredits.forEach(function (item) {
            if (!ids.has(item.id)) {
                ids.add(item.id);
                uniqueCredits.push(item);
            }
        });

        profileOutputFunc(detailData, IdsData);
        castOutputFunc(uniqueCredits);
        moreFunc(uniqueCredits);
    };

    personDataFunc(id);     // 전체 실행 호출문
};

/* 인물 클릭했을때 */
$(document).on('click', '.person-card', function (e) {
    const popup_wrap = document.querySelector('.popup-wrap');
    if (popup_wrap) popup_wrap.style.display = 'none';        // 기존 팝업 끄기

    const card = e.target.closest('.person-card');
    let personId = card.dataset.id;           // 클릭한 태그에 걸린 data-id값을 가져옴

    // 기존 filmo 팝업이 있으면 삭제
    const oldPopup = document.querySelector('#popup-filmography');
    if (oldPopup) oldPopup.remove();

    $('body').append('<div id="popup-filmography"></div>');
    $('#popup-filmography').load('/screen/pages/popup-filmography.html', function () {
        document.body.classList.add('popup-open');   // 스크롤 막기
        popup_filmography_func(personId);     // load 끝난 후 실행
    });
});

/* 팝업창 x버튼눌러서 끄기 */
document.addEventListener('click', function (e) {
    if (e.target.closest('.filmo-btn-x')) {
        document.body.classList.remove('popup-open');
        document.querySelector('#popup-filmography').remove();  // html에 추가했던 팝업을 지움
        $('html').css({ 'overflow': 'auto' });                  // 다른 팝업에서 잠궈놓은거 품
    }
});
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                          인물 팝업 (이태현)
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
//                      movie, tv 팝업 (조성경)
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */


//// 무비팝업

$('body').append('<div class="popup-wrap"></div>');
$('.popup-wrap').load('/screen/pages/popup-movieDetails.html', function () {
    //const popup_wrap = document.querySelector('.popup-wrap');
    //const el_slide = document.querySelectorAll('.slide');
    setTimeout(function () {

        $(document).on('click', '.slide', function (e) {
            e.preventDefault();

            let _this = e.target.parentElement.classList.contains('slide') ? e.target.parentElement : e.target.parentElement.parentElement;
            if (_this.classList.contains('slide')) {

                $('.popup-wrap').css({ 'display': 'flex' });
                $('html').css({ 'overflow': 'hidden' });

                let id = _this.getAttribute('data-href');
                let type = _this.getAttribute('data-type');

                if (type == '영화') {
                    popdataFun(id, type);
                }
                else {
                    popdataFunTv(id, type);
                }

                //로딩 아이콘 출력
                const el_popup = document.querySelector('.popup');
                $('.popup-wrap').append(`
        <div class="loader loader--style3" title="2">
          <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
          <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
            <animateTransform attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="0.6s"
              repeatCount="indefinite"/>
            </path>
          </svg>
        </div>`);
            }
        })
    }, 1000)

});

let popdataFun = async function (id, type) {

    const el_popup = document.querySelector('.popup');

    let img_path = 'https://image.tmdb.org/t/p/w500/';
    el_popup.innerHTML = '<p class="btn-x" id="close-btn"><img draggable="false" src="/screen/image/ic_x.svg" alt=""></p>';

    let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=be70ce351ebf9cdf3c901d28de3db6a3&append_to_response=videos,images,casts&language=ko-kr`);
    let data = await res.json();

    let resPost = await fetch(`https://api.themoviedb.org/3/movie/${id}/images?api_key=be70ce351ebf9cdf3c901d28de3db6a3&language=ko-KR&watch_region=KR`);
    let dataPost = await resPost.json();

    let resVdo = await fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=be70ce351ebf9cdf3c901d28de3db6a3&language=ko-KR&watch_region=KR`);
    let dataVdo = await resVdo.json();

    let resRating = await fetch(`https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=be70ce351ebf9cdf3c901d28de3db6a3`);
    let dataRating = await resRating.json();

    let resOtt = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=a3a99689753df933ab4c76e497b6c0b7`);
    let dataOtt = await resOtt.json();

    $('.loader').remove();

    let genres = '';
    data.genres.forEach(function (값, 순번) {
        genres += `<span>${값.name}</span>`;
    })

    const img_path_OG = 'https://image.tmdb.org/t/p/original';

    //하이라이트반복문
    let videos = '';
    if (data.videos.results.length) {
        data.videos.results.forEach(function (값, 순번) {
            if (순번 < 2) {
                videos += `<p>
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${값.key}"  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </p>`;
            }
        })
    } else {
        dataPost.backdrops.forEach(function (값, 순번) {
            if (순번 < 2) {
                videos += `<a draggable="false" href="${img_path_OG + 값.file_path}">
                            <img draggable="false" width="100%" height="100%" src="${img_path + 값.file_path}">
                        </a>`;
            }
        });
    }
    //출연진반복분
    let casts = '';
    data.casts.cast.forEach(function (값, 순번) {

        casts += `<li class="act-profi person-card" data-id="${값.id}">
                        <p><img draggable="false" src="${값.profile_path ? img_path + 값.profile_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                        <b>${값.name}</b>
                        <span>${값.character}</span>
                </li>`;

    })

    //관련콘텐츠에 다른 영화 누르면 내용 바뀜
    let etc = '';
    dataVdo.results.forEach(function (값, 순번) {

        etc += `
            
            <p data-href="${값.id}" data-type="영화" class="slide">
            <img draggable="false" src="${값.poster_path ? img_path + 값.poster_path : '/screen/image/img_noimage.jpg'}" alt="">
            </p>
            `;

    })


    /* 연령 출력 */
    let ko = dataRating.results.find(r => r.iso_3166_1 === "KR");
    let us = dataRating.results.find(r => r.iso_3166_1 === "US");

    let certification = "";

    if (ko) {
        certification = ko.release_dates.find(d => d.certification)?.certification;
    }

    if (!certification && us) {
        certification = us.release_dates.find(d => d.certification)?.certification;
    }

    function getAgeLabel(certification) {
        const ratingMap = {
            "ALL": "All",
            "G": "All",
            "전체관람가": "All",
            "PG": "12",
            "PG-13": "12",
            "12": "12",
            "15": "15",
            "R": "19",
            "19": "19",
            "청소년관람불가": "19",
            "NC-17": "19"
        };

        return ratingMap[certification] || "연령 정보 없음";
    }



    /* OTT 필터링 */
    let img_path_logo = 'https://image.tmdb.org/t/p/original';

    let kr = dataOtt.results.KR;

    let providers = [
        ...(kr?.flatrate || []),
        ...(kr?.rent || []),
        ...(kr?.buy || [])
    ];

    const myOTT = [8, 350, 1883, 356, 337];
    /* 
        넷플릭스 : 8
        애플TV : 350
        티빙 : 1883
        웨이브 : 356
        디즈니플러스 : 337
    */

    let printedOTT = new Set();   // 이미 출력한 OTT 저장

    let ottLogoOutput = '';

    providers.forEach(function (p) {

        if (myOTT.includes(p.provider_id) && !printedOTT.has(p.provider_id)) {

            printedOTT.add(p.provider_id);  // 출력한 OTT 기록

            ottLogoOutput += `
        <a>
            <img draggable="false" src="${img_path_logo + p.logo_path}">
        </a>`;
        }

    });


    //출력시작~~~~~

    //타이틀
    el_popup.innerHTML += `<div class="title">
                <p class="poster"><img class="detail-img" draggable="false" src="${data.poster_path ? img_path + data.poster_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                <div class="title-txt">
                    <p class="drama">${type}</p>
                    <div class="title-span">
                        <b>${data.title}</b>
                        <span>${getAgeLabel(certification)}</span>  
                        <small>(${data.release_date})</small>
                    </div>
                    ${data.tagline ? `<p class="text">“${data.tagline}”</p>` : ''}
                    <div class="popup-tag">
                        <p>개요</p>
                        <span>${data.origin_country} | </span>
                        <span>${data.runtime}</span>
                        <div class="popup-text">
                            <p>줄거리요약</p>
                            <span>
                                ${data.overview ? data.overview : '줄거리 정보가 제공되지 않습니다.'}
                            </span>
                        </div>
                    </div>
                    <div class="popup-tag2">
                        <b>${data.vote_average.toFixed(1)}</b>
                    ${genres}                    
                    </div>
                    <div class="ott-logo">
                        ${ottLogoOutput}
                    </div>
                </div>          
            </div>`;

    //비디오
    el_popup.innerHTML += `<div class="hig">
                <b>하이라이트</b>
                <div class="hig-img">
                    ${videos.length ? videos : '제공되지않습니다.'}                
                </div>
            </div>`;

    //출연진
    //casts.cast[0].profile_path/ character / original_name
    el_popup.innerHTML += `<div class="actor">
                <b>주요 출연진</b>
                <ul class="act drag-area">
                    ${casts}
                </ul>
            </div>`;

    //관련콘텐츠
    el_popup.innerHTML += `<div class="content-mov">
                <b>관련 콘텐츠</b>
                <div class="mov-img click-area">
                    ${etc}
                </div>
            </div>`;



    const popup_wrap = document.querySelector('.popup-wrap');
    const el_xBtn = document.querySelector('.btn-x');

    el_xBtn.addEventListener('click', function () {
        popup_wrap.style = 'display:none';
        $('html').css('overflow', 'auto');
    });

    //무비팝업 줄거리요약 클릭하면 내용 다 보이게
    const el_titleTxt = document.querySelectorAll('.popup-text span');

    el_titleTxt.forEach(function (popt, i) {
        popt.addEventListener('click', function () {
            popt.classList.toggle('active');
        })
    })

    dragFunc1();
}






















///// tv팝업


let popdataFunTv = async function (id, type) {

    const el_popup = document.querySelector('.popup');
    let img_path = 'https://image.tmdb.org/t/p/w500/';
    el_popup.innerHTML = '<p class="btn-x" id="close-btn"><img draggable="false" src="/screen/image/ic_x.svg" alt=""></p>';

    let res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=be70ce351ebf9cdf3c901d28de3db6a3&append_to_response=videos,images,credits&language=ko-kr`);
    let data = await res.json();

    let resVdo = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=be70ce351ebf9cdf3c901d28de3db6a3`);
    let dataVdo = await resVdo.json();

    let resImg = await fetch(`https://api.themoviedb.org/3/tv/${id}/images?api_key=be70ce351ebf9cdf3c901d28de3db6a3`);
    let dataImg = await resImg.json();

    let season = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/1?api_key=be70ce351ebf9cdf3c901d28de3db6a3&append_to_response=videos,images,credits&language=ko-kr`);
    let seaData = await season.json();

    let resRating = await fetch(`https://api.themoviedb.org/3/tv/${id}/content_ratings?api_key=be70ce351ebf9cdf3c901d28de3db6a3`);
    let dataRating = await resRating.json();

    let resOtt = await fetch(`https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=a3a99689753df933ab4c76e497b6c0b7`);
    let dataOtt = await resOtt.json();

    $('.loader').remove();


    //연령
    let rating = dataRating.results.filter(function (t) {
        return t.iso_3166_1 == 'KR'/*  || t.iso_3166_1 == 'US' */;
    })

    if (!rating.length) rating.push({ rating: 'ALL' });




    //출연진반복문
    let tvCasts = '';

    if (data.credits && data.credits.cast) {

        data.credits.cast.slice(0, 10).forEach(function (c) {
            tvCasts += `
            <li class="act-profi person-card" data-id="${c.id}">
                <p><img draggable="false" src="${c.profile_path ? img_path + c.profile_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                <b>${c.name}</b>
                <span>${c.character}</span>
            </li>`;
        });
    }




    //에피소드반복문    let tvCasts = '';
    let tvEpisodes = '';
    if (seaData.episodes && seaData.episodes.length) {
        seaData.episodes.forEach(function (ep) {
            let episodeImg = ep.still_path
                ? `<p><img draggable="false" src="${img_path + ep.still_path}" alt=""></p>`
                : `<p><img draggable="false" src="/screen/image/img_noimage.jpg" alt=""></p>`; // 대체 이미지

            tvEpisodes += `
                <li class="con">
                    <div class="con-box">
                        ${episodeImg}
                        <span>${ep.episode_number}</span>
                    </div>
                    <div class="con2">
                        <b>${ep.name || '제목 없음'}</b>
                        <p>${ep.overview || '에피소드 정보가 제공되지 않습니다.'}</p>
                    </div>
                </li>`;
        });
    } else {
        tvEpisodes = `<li style="color:#999;">에피소드 정보가 없습니다.</li>`;
    }



    //시즌반복문
    let tvSeason = '';
    if (data.seasons) {
        data.seasons.forEach(function (season) {
            if (season.season_number != 0) {
                tvSeason += `
                        <option value="${season.season_number}">
                            Season ${season.season_number}
                        </option>`;
            }
        });
    }

    //별점 반복문
    let tit = '';
    tit += `<b>${data.vote_average.toFixed(1)}</b>`;
    data.genres.forEach(function (t) {
        tit += `<span>${t.name}</span>`;
    })

    const img_path_OG = 'https://image.tmdb.org/t/p/original';

    // 하이라이트
    let tv_videos = '';
    if (dataVdo.results.length) {
        dataVdo.results.forEach(function (값, 순번) {
            if (순번 < 2) {
                tv_videos += `<p>
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${값.key}"  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </p>`;
            }
        })
    } else {
        dataImg.backdrops.forEach(function (값, 순번) {
            if (순번 < 2) {
                tv_videos += `<a draggable="false" href="${img_path_OG + 값.file_path}">
                            <img draggable="false" width="100%" height="100%" src="${img_path + 값.file_path}">
                        </a>`;
            }
        });
    }

    /* OTT 필터링 */
    let img_path_logo = 'https://image.tmdb.org/t/p/original';

    let kr = dataOtt.results?.KR;

    let providers = [
        ...(kr?.flatrate || []),
        ...(kr?.rent || []),
        ...(kr?.buy || [])
    ];

    const myOTT = [8, 350, 1883, 356, 337];
    /* 
        넷플릭스 : 8
        애플TV : 350
        티빙 : 1883
        웨이브 : 356
        디즈니플러스 : 337
    */

    let printedOTT = new Set();   // 이미 출력한 OTT 저장

    let ottLogoOutput = '';

    providers.forEach(function (p) {

        if (myOTT.includes(p.provider_id) && !printedOTT.has(p.provider_id)) {

            printedOTT.add(p.provider_id);  // 출력한 OTT 기록

            ottLogoOutput += `
        <a>
            <img draggable="false" src="${img_path_logo + p.logo_path}">
        </a>`;
        }

    });


    //타이틀
    el_popup.innerHTML += `<div class="title">
                <p class="poster"><img class="detail-img" draggable="false" src="${data.poster_path ? img_path + data.poster_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                <div class="title-txt">
                    <p class="drama">${type}</p>
                    <div class="title-span">
                    <b>${data.name}</b>
                    <span>${rating[0].rating}</span>
                    <small>${data.first_air_date}</small>
                </div>
                    
                <div class="popup-tag">
                    <p>개요</p>
                    <span>${data.origin_country} | </span>
                    <span>${data.number_of_episodes}부작</span>
                    <div class="popup-text">
                        <p>줄거리요약</p>
                        <span>${data.overview}</span>
                    </div>
                </div>
                <div class="popup-tag2">
                    ${tit}
                    
                    </div>
                        <div class="ott-logo">
                            ${ottLogoOutput}
                        </div>
                    </div>          
                </div>`;

    //비디오
    el_popup.innerHTML += `<div class="hig">
            <b>하이라이트</b>
            <div class="hig-img">${tv_videos}</div>
            </div>`;


    //출연진
    //casts.cast[0].profile_path/ character / original_name
    el_popup.innerHTML += `<div class="actor">
            <b>주요 출연진</b>
            <ul class="act drag-area">
            ${tvCasts}
            </ul>`;

    //에피소드
    el_popup.innerHTML += `<div class="episode">
            <div class="solid">
            <b>Episode 정보</b>
            <hr style="margin: 30px 0; border-color: #FF3535; ">
            <select class="tv-option">
                ${tvSeason}
            </select>
            </div>
            <ul>
                ${tvEpisodes}
            </ul>
            </div>`



    //TV프로그램 팝업에 에피소드 영역

    const popup_wrap = document.querySelector('.popup-wrap');
    const episode = document.querySelector('.episode ul');
    const tvOption = document.querySelector('.tv-option');
    const el_xBtn = document.querySelector('.btn-x');


    //시즌 클릭시 해당 회차 조회 가능 
    tvOption.addEventListener('change', async function () {
        let value = tvOption.value;
        let season = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${value}?api_key=be70ce351ebf9cdf3c901d28de3db6a3&append_to_response=videos,images,credits&language=ko-kr`);
        let seaData = await season.json();
        let tvEpisodes = '';

        if (seaData.episodes && seaData.episodes.length) {
            seaData.episodes.forEach(function (ep) {
                let episodeImg = ep.still_path
                    ? `<p><img draggable="false" src="${img_path + ep.still_path}" alt=""></p>`
                    : `<p><img draggable="false" src="/screen/image/img_noimage.jpg""></p>`; // 대체 이미지

                tvEpisodes += `
                        <li class="con">
                            ${episodeImg}
                            <span>${ep.episode_number}</span>
                            <div class="con2">
                                <b>${ep.name || '제목 없음'}</b>
                                <p>${ep.overview || '에피소드 정보가 제공되지 않습니다.'}</p>
                            </div>
                        </li>`;
            });
        } else {
            tvEpisodes = `<li style="color:#999;">에피소드 정보가 없습니다.</li>`;
        }

        episode.innerHTML = tvEpisodes;


    })

    el_xBtn.addEventListener('click', function () {
        popup_wrap.style = 'display:none';
        $('html').css('overflow', 'auto');
    });

    //260305 추가 무비팝업 에피소드쪽 줄거리 클릭하면 내용 다 보이게
    const el_conT = document.querySelectorAll('.con2 p');

    el_conT.forEach(function (tx, i) {
        tx.addEventListener('click', function () {
            tx.classList.toggle('active');
        })
    });

    //260305 추가 무비팝업 줄거리요약 쪽 클릭하면 내용 다 보이게
    const el_titleTxt = document.querySelectorAll('.popup-text span');

    el_titleTxt.forEach(function (popt, i) {
        popt.addEventListener('click', function () {
            popt.classList.toggle('active');
        })
    })







    dragFunc1();
}




/* ================== 커서 =================== */
const cursor = document.querySelector(".cursor");
const cursorText = document.querySelector(".cursor-text span");


/* 마우스 이동 */
document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});


/* ====== hover 처리 ====== */

/* hover 들어갈 때 */
document.addEventListener("mouseover", (e) => {
    if (e.target.closest(".click-area")) {
        cursor.classList.add("click-hover");
        cursorText.textContent = "CLICK";
    }

    const dragArea = e.target.closest(".drag-area");
    if (!dragArea) return;

    if (dragArea.classList.contains("hovering")) return;    // 이미 hover 상태면 다시 실행하지 않음

    if (dragArea.scrollWidth > dragArea.clientWidth) {
        dragArea.classList.add("hovering");                 // 한번만 실행하기위한 클래스 추가
        cursor.classList.add("drag-hover");
        cursorText.textContent = "DRAG";
    }
});

/* hover 나갈 때 */
document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".click-area")) {
        cursor.classList.remove("click-hover");
        cursorText.textContent = "";
    }

    const dragArea = e.target.closest(".drag-area");
    if (!dragArea) return;

    // drag-area를 완전히 벗어났는지 체크
    if (!dragArea.contains(e.relatedTarget)) {
        dragArea.classList.remove("hovering");
        cursor.classList.remove("drag-hover");
        cursorText.textContent = "";
    }
});

/* ====== 클릭 / 드래그 상태 ====== */

document.addEventListener("mousedown", (e) => {

    if (e.target.closest(".click-area")) {
        cursor.classList.add("active");
    }

    if (e.target.closest(".drag-area")) {
        cursor.classList.add("active");
        cursor.classList.add("pause"); // 회전 멈춤용
    }

});

document.addEventListener("mouseup", () => {
    cursor.classList.remove("active");
    cursor.classList.remove("pause");
});


/* 드래그 스크롤 */
let dragFunc1 = function () {
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
};
dragFunc1();