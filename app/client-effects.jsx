"use client";

import { useEffect } from "react";

export default function ClientEffects() {
  useEffect(() => {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const root = document.documentElement;
    const hero = document.querySelector(".hero");
    const mark = document.querySelector(".hero-mark");
    const mobileQuery = window.matchMedia("(max-width: 620px)");
    let frameId;

    const applyHeroProgress = (progress) => {
      root.style.setProperty("--scroll-progress", progress.toFixed(3));

      const maskProgress = clamp((progress - 0.12) / 0.5, 0, 1);
      const sideInset = maskProgress * (mobileQuery.matches ? 7 : 36);
      const topInset = maskProgress * (mobileQuery.matches ? 4 : 9);
      const bottomInset = maskProgress * (mobileQuery.matches ? 6 : 13);
      root.style.setProperty("--mask-inset-x", `${sideInset.toFixed(2)}vw`);
      root.style.setProperty("--mask-inset-top", `${topInset.toFixed(2)}vh`);
      root.style.setProperty("--mask-inset-bottom", `${bottomInset.toFixed(2)}vh`);

      const videoOpacity = progress < 0.68 ? 1 : clamp(1 - (progress - 0.68) / 0.14, 0, 1);
      root.style.setProperty("--video-opacity", videoOpacity.toFixed(3));
      if (mark) mark.style.pointerEvents = progress > 0.42 ? "none" : "auto";
    };

    const updateHero = () => {
      if (!hero) return;

      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        const range = Math.max(hero.offsetHeight - window.innerHeight, 1);
        const progress = clamp(window.scrollY / range, 0, 1);
        applyHeroProgress(progress);
        frameId = undefined;
      });
    };

    const playVideos = () => {
      const heroVideos = [...document.querySelectorAll(".hero-video-shell video")];
      const lazyVideos = [...document.querySelectorAll(".lazy-video")];

      const prepareVideo = (video) => {
        if (video.dataset.prepared === "true") return;
        video.dataset.prepared = "true";
        video.muted = true;
        video.playsInline = true;
        video.loop = false;

        const loopStart = 0.18;
        const loopPadding = 0.62;

        const seamlessLoop = () => {
          if (!Number.isFinite(video.duration) || video.duration <= 0) return;
          if (video.currentTime >= video.duration - loopPadding) {
            video.currentTime = loopStart;
          }
        };

        const keepPlaying = () => {
          const playPromise = video.play();
          if (playPromise?.catch) playPromise.catch(() => {});
        };

        video.addEventListener("loadedmetadata", () => {
          if (video.currentTime < loopStart) video.currentTime = loopStart;
        });
        video.addEventListener("canplay", keepPlaying, { once: true });
        video.addEventListener("timeupdate", seamlessLoop);
        video.addEventListener("ended", () => {
          video.currentTime = loopStart;
          keepPlaying();
        });
        video.addEventListener("stalled", keepPlaying);
        keepPlaying();
      };

      heroVideos.forEach((video) => {
        video.preload = "auto";
        prepareVideo(video);
      });

      if (!("IntersectionObserver" in window)) {
        lazyVideos.forEach(prepareVideo);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const video = entry.target;
            video.preload = "auto";
            prepareVideo(video);
            observer.unobserve(video);
          });
        },
        { rootMargin: "320px 0px" },
      );

      lazyVideos.forEach((video) => observer.observe(video));

      const monitorLoop = () => {
        document.querySelectorAll("video[data-prepared='true']").forEach((video) => {
          if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime >= video.duration - 0.62) {
            video.currentTime = 0.18;
          }
        });
        window.requestAnimationFrame(monitorLoop);
      };

      window.requestAnimationFrame(monitorLoop);
    };

    const initCompare = () => {
      const wrapper = document.querySelector("[data-before-after]");
      const input = wrapper?.querySelector("input");
      if (!wrapper || !input) return;
      const setValue = () => wrapper.style.setProperty("--compare", `${input.value}%`);
      input.addEventListener("input", setValue);
      setValue();
    };

    const initForm = () => {
      const form = document.querySelector(".reserve-form");
      if (!form) return;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        const original = button.textContent;
        button.textContent = "Request noted";
        button.disabled = true;
        window.setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
          form.reset();
        }, 1800);
      });
    };

    updateHero();
    playVideos();
    initCompare();
    initForm();
    window.addEventListener("scroll", updateHero, { passive: true });
    window.addEventListener("resize", updateHero);
    return () => {
      window.removeEventListener("scroll", updateHero);
      window.removeEventListener("resize", updateHero);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
