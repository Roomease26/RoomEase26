import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Sparkles, Download, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-slate-800">Room Visualizer AI</h2>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your dream room (e.g., 'A modern minimal bedroom with large windows and wooden floor')"
          className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
        />

        <div className="flex gap-2">
          {(['1K', '2K', '4K'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                size === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          {loading ? 'Generating...' : 'Generate Visualization'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square rounded-2xl overflow-hidden shadow-lg"
        >
          <img src={image} alt="Generated" className="w-full h-full object-cover" />
          <a
            href={image}
            download="room-visualization.png"
            className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
          >
            <Download className="w-5 h-5 text-slate-900" />
          </a>
        </motion.div>
      )}
    </div>
  );
}
