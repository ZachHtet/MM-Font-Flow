"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is MM Font Flow?",
    answer: "MM Font Flow is a tool that helps you convert between different Myanmar font formats (Unicode, Zawgyi, and Win) and extract text from images containing Myanmar script."
  },
  {
    question: "How do I convert from Myanmar Unicode to Zawgyi or Win Fonts?",
    answer: "Just paste your Unicode text into unicode text box and it will instantly convert it to Zawgyi and Win formats."
  },
  {
    question: "How does the image text extraction work?",
    answer: "Our tool uses OCR (Optical Character Recognition) technology to analyze images and extract Myanmar text. Once extracted, it's automatically converted to all three supported font encodings."
  },
  {
    question: "Why do I need to convert between Myanmar font formats?",
    answer: "Different Myanmar font systems are used across various platforms and legacy systems. Converting between them ensures compatibility when sharing text between applications or platforms that use different encoding systems."
  },
  {
    question: "Is my data private when using this tool?",
    answer: "Yes. All processing happens in your browser and on secure servers. We don't store your images or extracted text. Your data is processed temporarily for extraction only and then discarded."
  },
  {
    question: "What image formats are supported?",
    answer: "Currently, we support JPG and PNG formats. Make sure your images are clear and the text is readable for the best results."
  },
  {
    question: "Can I extract Burmese/Myanmar text from an image or screenshot?",
    answer: "Yes! MM Font Flow supports OCR (Optical Character Recognition). Upload an image containing Myanmar text, and it will extract editable text you can convert between fonts."
  },
  {
    question: "How do I improve the accuracy of Myanmar text extraction from images?",
    answer: "For better OCR results, use high-resolution images with clear, well-lit Burmese text. Avoid blurry or pixelated screenshots, and aim for high contrast (e.g., black text on a white background). Cropping the image to focus on just the text area helps too. Please note: handwritten text is not fully supported and may produce inaccurate results."
  },
  {
    question: "What languages does the OCR support?",
    answer: "Our OCR currently supports Myanmar script and English. If your text is in other languages, it may not be accurately recognized."
  },
  {
    question: "Is MM Font Flow free to use?",
    answer: "Yes, Font Flow is completely free. It is built for designers, developers, and anyone working with Myanmar text who wants a faster, cleaner workflow."
  }
 
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
        Frequently Asked Questions
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden break-inside-avoid"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex justify-between items-center p-6 text-left bg-muted hover:bg-primary/10 transition-colors duration-200"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-[#D96E4B] transition-transform duration-300 ${
                  openItems.includes(index) ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 ${
                openItems.includes(index)
                  ? "max-h-[800px] opacity-100 p-6 bg-card/50 text-muted-foreground"
                  : "max-h-0 opacity-0 p-0"
              } overflow-hidden`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
