import './style.css'

const video = document.getElementById('video'); // 풍경 비디오
const fvideo = document.getElementById('fvideo'); // 얼굴 비디오
const canvas = document.getElementById('output'); // 디버그용 랜드마크 표시할 캔버스
const ctx = canvas.getContext('2d'); // 캔버스 컨텍스트

// 비디오 소스 설정 (여기에 플레이할 비디오 파일 경로를 입력하세요)
// video.src = '6.mp4';
const videoSources = ['./1.mp4', './2.mp4', './3.mp4', './4.mp4', './5.mp4', './6.mp4'];

let currentVideoIndex = 0;

function setVideoSource() {
  video.src = videoSources[currentVideoIndex];
  video.onloadedmetadata = () => {
    video.play();
  };
}

setVideoSource();

video.addEventListener('click', () => {
  currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
  setVideoSource();
});

// 캔버스 크기 설정
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', onResize);

// FaceMesh 초기화
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});

faceMesh.setOptions({
  maxNumFaces: 1,
});

faceMesh.onResults(onResults);

// 눈 사이 포인트 (nose bridge top)
const EYE_POINT = 168;
const WEIGHT = 0.2

function onResults(results) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      const point = landmarks[EYE_POINT];

      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();

      const videoOffsetX = (point.x - 0.5) * video.videoWidth * WEIGHT;
      const videoOffsetY = (point.y - 0.5) * video.videoHeight * WEIGHT;

      video.style.transform = `translate(calc(-50% - ${videoOffsetX}px), calc(-50% + ${videoOffsetY}px))`;
    }
  }

  ctx.restore();
}

// 카메라 초기화
const camera = new Camera(fvideo, {
  onFrame: async () => {
    await faceMesh.send({image: fvideo});
  },
});
camera.start();