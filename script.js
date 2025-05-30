gsap.registerPlugin(ScrollTrigger);

const bike = document.querySelector(".bike");
const road = document.querySelector(".road");
const roadText = document.querySelector(".road-text");
const headingCards = document.querySelector(".heading-cards");
const roadContainer = document.querySelector(".road-container");
const roadWrapper = document.querySelector(".road-wrapper");

const text = roadText.textContent.trim();
roadText.innerHTML = "";

text.split("").forEach(char => {
  const span = document.createElement("span");
  if (char === " ") {
    span.innerHTML = "&nbsp;";
    span.style.width = "0.3em";
    span.style.display = "inline-block";
  } else {
    span.textContent = char;
    span.style.opacity = "0";
    span.style.display = "inline-block";
  }
  roadText.appendChild(span);
});

gsap.set(roadText, { visibility: "visible", opacity: 1 });
gsap.set(roadText.querySelectorAll("span"), { opacity: 0 });

let scrollTween;

function createAnimation() {
  if (scrollTween) {
    scrollTween.scrollTrigger.kill();
    scrollTween.kill();
  }

  const wrapperRect = roadWrapper.getBoundingClientRect();
  const totalScroll = wrapperRect.width * 1.3;
  const targetX = wrapperRect.width + 500;

  scrollTween = gsap.to(bike, {
    x: targetX,
    ease: "none",
    scrollTrigger: {
      trigger: ".road-wrapper",
      start: "top top",
      end: "+=" + totalScroll,
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: self => {
        const roadRect = road.getBoundingClientRect();
        const bikeRect = bike.getBoundingClientRect();
        const bikeFrontX = bikeRect.left + bikeRect.width * 0.5;

        const roadBackgroundX = -bikeFrontX * 0.5;
        gsap.set(".road", { backgroundPositionX: `${roadBackgroundX}px` });

        const greenWidth = Math.max(0, bikeFrontX - roadRect.left);
        gsap.set(".road-white", { width: greenWidth });

        const spans = roadText.querySelectorAll("span");
        spans.forEach(span => {
          const spanRect = span.getBoundingClientRect();
          const spanCenter = spanRect.left + spanRect.width / 2;
          span.style.opacity = bikeFrontX >= spanCenter ? "1" : "0";
        });

        const shiftStartX = window.innerWidth * 0.3;

        if (bikeFrontX >= shiftStartX) {
          const maxShift = window.innerWidth * 1.0;
          const progress = (bikeFrontX - shiftStartX) / window.innerWidth;
          const shiftAmount = Math.min(progress * totalScroll * 0.5, maxShift);

          gsap.to([roadText, headingCards], {
            x: -shiftAmount,
            duration: 0.2,
            ease: "power1.out"
          });
        } else {
          gsap.set([roadText, headingCards], { x: 0 });
        }

        const fadeDistance = 200;
        const cards = document.querySelectorAll('.heading-card');
        cards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;

          const distance = bikeFrontX - cardCenterX;
          let opacity;

          if (distance >= 0) {
            opacity = 1;
          } else if (distance >= -fadeDistance && distance < 0) {
            opacity = 1 + distance / fadeDistance;
          } else {
            opacity = 0;
          }

          opacity = Math.min(Math.max(opacity, 0), 1);

          gsap.set(card, { opacity, scale: 1 });

          if (opacity > 0 && !card.classList.contains('visible')) {
            card.classList.add('visible');
          } else if (opacity === 0 && card.classList.contains('visible')) {
            card.classList.remove('visible');
          }
        });
      },
      onLeave: () => {}
    }
  });
}

createAnimation();

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    createAnimation();
  }, 250);
});
