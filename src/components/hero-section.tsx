"use client";

export function HeroSection() {
  return (
    <div className="text-center mb-8 sm:mb-10 md:mb-12">
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
        IMAGE ⮕ TEXT<br />
        CONVERT MYANMAR FONTS.
      </h1>
      <p className="text-muted-foreground text-base sm:text-md md:text-lg">
      Upload an image to instantly copy Myanmar text.<br />
        Switch between Unicode, Zawgyi, and Win fonts
      </p>
    </div>
  );
}