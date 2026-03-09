// 💡 검색창 배경 - 인기순위로 포스터 자동 변경하기
const backImg = document.querySelector('.top-back');





// 🎨 인기순 데이터 가져오기
let backImgFun = async function () {
    let res = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=a3a99689753df933ab4c76e497b6c0b7&language=ko-KR&sort_by=popularity.desc');
    let data = await res.json();

    backImgOutput(data);
};





// 💡 인기순 포스터 배경 출력하기
// let backImgOutput = function (data) {
//     const img_path1980 = 'https://image.tmdb.org/t/p/original';
//     let imageUrl = img_path1980 + data.results[0].backdrop_path;
//     backImg.style.background = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${imageUrl}) center center / cover no-repeat`;
// };


// 💡 랜덤 배경 출력하기
let backImgOutput = function (data) {
    const img_path1980 = 'https://image.tmdb.org/t/p/original';

    let movies = data.results.filter(movie => movie.backdrop_path);

    let randomIndex = Math.floor(Math.random() * movies.length);
    let movie = movies[randomIndex];

    let imageUrl = img_path1980 + movie.backdrop_path;

    backImg.style.background = `
        linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
        url(${imageUrl}) center center / cover no-repeat
    `;
};
backImgFun();



// 🎨 전역함수 모음
const img_path = 'https://image.tmdb.org/t/p/w300';
const moviesGenres = JSON.parse(localStorage.moviesGenres);
const tvGenres = JSON.parse(localStorage.tvGenres);
const el_searchTitle = document.querySelector('.scMain h3');
let datasets = [];






// 🕵️‍♂️ 영화/TV 검색 함수
let searchFun = async function (keyword) {
    // 영화 검색
    let res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(keyword)}&api_key=be70ce351ebf9cdf3c901d28de3db6a3&language=ko-KR&watch_region=KR`);
    let movieData = await res.json();

    // TV 검색
    let res2 = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(keyword)}&api_key=be70ce351ebf9cdf3c901d28de3db6a3&language=ko-KR&watch_region=KR`);
    let tvData = await res2.json();

    let res3 = await fetch(`https://api.themoviedb.org/3/search/person?api_key=be70ce351ebf9cdf3c901d28de3db6a3&query=${encodeURIComponent(keyword)}&language=ko-KR&watch_region=KR`);
    let personData = await res3.json();

    datasets = [
        { type: '영화', cName: ['movie', 'searchList'], data: movieData.results },
        { type: 'TV프로그램', cName: ['tv', 'searchList'], data: tvData.results },
        { type: '인물', cName: ['person', 'searchH'], data: personData.results }
    ];


    let a = [], b = [];
    if (personData.results.length) {
        personData.results[0].known_for.forEach(function (값) {
            값.media_type == 'movie' ? a.push(값) : b.push(값);
        })

        datasets[0].data = [...movieData.results, ...a];
        datasets[1].data = [...tvData.results, ...b];
    }



    datasets.sort(function (a, b) {
        return b.data.length - a.data.length; // 내림차순
    });


    // DOM 출력
    domContral(datasets);
}






// 🎬 DOM 출력 함수
let domContral = function (datasets) {
    const search_wrap = document.querySelector('.search-wrap');
    const searchAll = document.querySelectorAll('.data-list');
    const scMenu = document.querySelector('.scMenu');


    //초기화
    if (searchAll.length) {
        searchAll.forEach((element) => element.remove());
    }
    scMenu.innerHTML = '';

    scMenu.innerHTML += `<button class="active">전체(${datasets[0].data.length + datasets[1].data.length + datasets[2].data.length})</button>`;


    // 📌 화면 출력
    datasets.forEach(function (obj, i) {

        scMenu.innerHTML += `<button>${obj.type}(${obj.data.length})</button>`;
        search_wrap.innerHTML += `
            <div class="searchAll ${obj.cName[0]} data-list">
                <div class="search">
                    <b>${obj.type} 검색결과(${obj.data.length})</b>
                </div>
                <div class="${obj.cName[1]} drag-area">
                    ${output(obj)}
                </div>
            </div>`;
    });

    searchTab();

    dragFunc();
}






// 💡 메뉴별 화면 다르게 출력하기
let output = function (obj) {

    const activeBtn = document.querySelector('.scMenu button.active');
    if (activeBtn.textContent.startsWith('전체')) {
        return output8(obj);
    } else {
        return output20(obj);
    }
};







// 💡 함수 만들기 - '전체 탭에서 8개의 컨텐츠만 보이게 하기'
let output8 = function (obj) {
    return obj.data.slice(0, 8).map(function (item) {
        let movGen = [];
        let tvGen = [];
        if (item.genre_ids) {
            moviesGenres.forEach(function (g) {
                if (item.genre_ids.includes(g.id)) {
                    movGen.push(g.name);
                }
            });
            tvGenres.forEach(function (g) {
                if (item.genre_ids.includes(g.id)) {
                    tvGen.push(g.name);
                }
            });
        }
        switch (obj.type) {
            case '영화':
                return `
                        <figure data-href="${item.id}" data-type="영화" class="slide">
                            <p class="imgs-wrap"><img draggable="false" src="${item.poster_path ? img_path + item.poster_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                            <figcaption>
                                <b>${item.title}</b>
                                <p class="detail">${item.release_date ? item.release_date.split('-')[0] : 'N/A'} · ${movGen.slice(0, 2).join(' / ')}</p>
                                <p class="detail">★${item.vote_average.toFixed(1)}</p>
                            </figcaption>
                        </figure>
                    `;
            case 'TV프로그램':
                return `
                        <figure data-href="${item.id}" data-type="TV" class="slide">
                            <p class="imgs-wrap"><img draggable="false" src="${item.poster_path ? img_path + item.poster_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                            <figcaption>
                                <b>${item.name}</b>
                                <p class="detail">${item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A'} · ${tvGen.slice(0, 2).join(' / ')}</p>
                                <p class="detail">★${item.vote_average.toFixed(1)}</p>
                            </figcaption>
                        </figure>
                    `;
            default:
                return `
                        <figure>
                            <p class="imgsH-wrap"><img draggable="false" class="person-card" data-id="${item.id}" src="${item.profile_path ? img_path + item.profile_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                            <p class="detail">${item.name}</p>
                        </figure>
                    `;
        }

    }).join('')
};






// 💡 함수 만들기 - '메뉴별 모든 컨텐츠 보이게 하기'
let output20 = function (obj) {
    console.log(obj)
    return obj.data.map(function (item) {
        let movGen = [];
        let tvGen = [];
        if (item.genre_ids) {
            moviesGenres.forEach(function (g) {
                if (item.genre_ids.includes(g.id)) {
                    movGen.push(g.name);
                }
            });
            tvGenres.forEach(function (g) {
                if (item.genre_ids.includes(g.id)) {
                    tvGen.push(g.name);
                }
            });
        }
        switch (obj.type) {
            case '영화':
                return `
                        <figure data-href="${item.id}" data-type="영화" class="slide">
                            <p class="imgs-wrap"><img draggable="false" src="${item.poster_path ? img_path + item.poster_path : '/screen/image/img_noimage.jpg'}" alt=""></p>
                            <figcaption>
                                <b>${item.title}</b>
                                <p class="detail">${item.release_date ? item.release_date.split('-')[0] : 'N/A'} · ${movGen.slice(0, 2).join(' / ')}</p>
                                <p class="detail">★${item.vote_average.toFixed(1)}</p>
                            </figcaption>
                        </figure>
                    `;
            case 'TV프로그램':
                return `
                        <figure data-href="${item.id}" data-type="TV" class="slide">
                            <p class="imgs-wrap"><img draggable="false" src="${item.poster_path ? img_path + item.poster_path : '/screen/image/img_noimage.jpg'}" alt="">
                            <figcaption>
                                <b>${item.name}</b>
                                <p class="detail">${item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A'} · ${tvGen.slice(0, 2).join(' / ')}</p>
                                <p class="detail">★${item.vote_average.toFixed(1)}</p>
                            </figcaption>
                        </figure>
                    `;
            default:
                return `
                        <figure>
                            <p class="imgsH-wrap"><img draggable="false" class="person-card" data-id="${item.id}" src="${item.profile_path ? img_path + item.profile_path : '/screen/image/img_noimage.jpg'}" alt="">
                            <p class="detail">${item.name}</p>
                        </figure>
                    `;
        }

    }).join('')
};






// 🔍 검색 input + form 이벤트
let searchEvent = function () {
    const el_form = document.querySelector('.header-search-box');
    const el_input = document.querySelector('.header-search-box input');

    el_form.addEventListener('submit', function (e) {
        e.preventDefault(); // 검색하면 기본으로 동작되는 '새로고침'을 막음
        searchFun(el_input.value.trim());
        el_searchTitle.innerText = `"${el_input.value}" 검색결과`;
    });
}






// 💡 메뉴 버튼 클릭 이벤트

let searchTab = function () {

    const scMenu = document.querySelector('.scMenu');


    scMenu.addEventListener('click', function (e) {

        const search_wrap = document.querySelector('.search-wrap');
        const searchListM = document.querySelector('.movie .searchList');
        const searchListT = document.querySelector('.tv .searchList');
        const searchH = document.querySelector('.searchH');
        const btn = e.target.closest('button'); // 버튼인지 확인

        if (!btn) return;

        // 모든 버튼에서 active 제거
        scMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));

        // 클릭한 버튼에만 active 추가
        btn.classList.add('active');


        // 버튼별 화면 표시
        const text = btn.textContent;


        if (text.startsWith('전체')) {
            search_wrap.querySelectorAll('.searchAll').forEach(el => el.style.display = 'block');
            domContral(datasets);
            searchListM.style = '';
            searchListT.style = '';
            searchH.style = '';

        } else if (text.includes('영화')) {
            search_wrap.querySelectorAll('.searchAll').forEach(el => el.style.display = el.classList.contains('movie') ? 'block' : 'none');
            let d = datasets.filter((obj) => obj.type == '영화');
            searchListM.style = 'flex-wrap:wrap';
            searchListM.innerHTML = output(...d);
        } else if (text.includes('TV프로그램')) {
            search_wrap.querySelectorAll('.searchAll').forEach(el => el.style.display = el.classList.contains('tv') ? 'block' : 'none');
            let d = datasets.filter((obj) => obj.type == 'TV프로그램');
            searchListT.style = 'flex-wrap:wrap';
            searchListT.innerHTML = output(...d);
        } else if (text.includes('인물')) {
            search_wrap.querySelectorAll('.searchAll').forEach(el => el.style.display = el.classList.contains('person') ? 'block' : 'none');
            let d = datasets.filter((obj) => obj.type == '인물');
            searchH.style = 'flex-wrap:wrap';
            searchH.innerHTML = output(...d);
        }
    });
}
searchEvent();








// 💡 메인에서 검색하면 검색페이지로 이동해서 바로 보이는 화면
let params = new URLSearchParams(document.location.search);
let keyword = params.get("keyword");

if (!keyword) {
    $('form').preventDefault();
    alert('검색어를 입력해주세요.');
} else {
    searchFun(keyword);
    el_searchTitle.innerText = `"${keyword}" 검색결과`;
}

// 검색리스트에 작품 클릭시 팝업 띄우기
let etc = '';





/* ====================================== */
/* 드래그 스크롤 */
let dragFunc = function () {
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
