import { useState, useRef } from "react";
import { Camera, Book, Sun, Moon, Lightbulb } from "lucide-react";

const LearningAssistant = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      // Try to request the environment (back) camera first
      const envConstraints = {
        video: { facingMode: { exact: "environment" } },
      };
      const envStream = await navigator.mediaDevices.getUserMedia(
        envConstraints
      );
      videoRef.current.srcObject = envStream;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.warn(
        "Cannot access back camera. Falling back to user camera:",
        err
      );
      try {
        // Now fallback to any available camera (usually the front camera)
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = fallbackStream;
        setIsRecording(true);
        setError(null);
      } catch (fallbackErr) {
        console.error("Camera access error (fallback):", fallbackErr);
        setError("Failed to access camera");
      }
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const captureImage = () => {
    if (!videoRef.current) return;

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg");
    return imageData;
  };

  const solveQuestion = async () => {
    speechSynthesis.cancel();
    try {
      setIsProcessing(true);
      setError(null);

      // Capture the current frame (as you do now)
      const imageData = captureImage();
      if (!imageData) {
        throw new Error("Failed to capture image.");
      }

      // Remove the `data:image/jpeg;base64,` prefix
      const base64Data = imageData.split(",")[1];

      // =========================================
      //  Send the base64 data to backend
      const backendUrl =
        "https://vidya-saathi-dot-seismic-monitor-388610.ue.r.appspot.com/generate-solution";
      // const backendUrl = "http://localhost:58325/generate-solution";

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: base64Data }), // Pass base64 data in JSON
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.statusText}`);
      }

      // Parse the backend’s response
      const result = await response.json();

      // For example, if your backend returns { decoded: "some text" }
      if (!result.solution) {
        throw new Error("No 'decoded' field in response.");
      }

      let text = result.solution;

      // Sanitize the text
      text = text.trim(); // Remove leading and trailing spaces
      text = text.replace(/^```html/, ""); // Remove markdown block start if exists
      text = text.replace(/```$/, ""); // Remove markdown block end if exists

      text = text.replace(/```/g, ""); // Remove any remaining markdown code blocks
      // text = text.replace(/<\/?[^>]+(>|$)/g, ""); // Remove any HTML tags
      // text = text.replace(/\*\*/g, ""); // Remove any remaining asterisks
      text = text.replace(/^\s*html\s*/i, ""); // Remove leading 'html' keyword if any

      setSolution(text);
      text = text.replace(/<\/?[^>]+(>|$)/g, "");
      text = text.replace(/style\s*=\s*["'][^"']*["']/g, ""); // Remove inline styles
      text = text.replace(/class\s*=\s*["'][^"']*["']/g, ""); // Remove class attributes
      text = text.replace(/id\s*=\s*["'][^"']*["']/g, ""); // Remove id attributes
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;

      // Extract the text content, which will strip out all HTML tags and attributes
      text = tempDiv.textContent || tempDiv.innerText || "";
      readSolutionAloud(text); // Read the solution aloud
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process the question. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsRecording(false);
  };

  // const readSolutionAloud = (text) => {
  //   const utterance = new SpeechSynthesisUtterance(text);
  //   speechSynthesis.speak(utterance);
  // };

  const readSolutionAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    // Try to find a female voice from the list
    // This is heuristic; each system has different voice names.
    const femaleVoice = voices.find((voice) => {
      const name = voice.name.toLowerCase();
      // Check for 'female' or 'zira' (Windows) or 'samantha' (macOS) or 'google uk english female' ...
      return (
        name.includes("female") ||
        name.includes("zira") ||
        name.includes("samantha") ||
        name.includes("eva") ||
        name.includes("woman") ||
        // Some 'locale' checks if needed:
        voice.lang === "en-GB" || // might be female on Google UK
        voice.lang === "en-US"
      );
    });

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Adjust pitch, rate, volume if desired
    // utterance.pitch = 1.0;
    // utterance.rate = 1.0;
    // utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-orange-50 text-gray-900"
      }`}
    >
      {/* Header with Indian-inspired design */}
      <header className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Book className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">विद्या साथी</h1>
            <span className="text-white/80">(Learning Companion)</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="text-white" />
            ) : (
              <Moon className="text-white" />
            )}
          </button>
        </div>
      </header>

      <main className="w-full min-h-[calc(100vh-64px)]">
        <div className="w-full text-center py-6">
          <h1 className="text-3xl font-bold">
            नमस्ते! Welcome to Your Learning Journey
          </h1>
          <p className="mt-2 text-gray-600">
            Point your camera at any question, and let us help you understand it
            better
          </p>
        </div>

        <div className="camera-wrapper">
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400/50" />
              </div>
            )}
          </div>

          {/* Responsive buttons container */}
          <div className="w-full p-4 flex flex-col gap-4 items-center sm:flex-row sm:justify-center">
            {!isRecording ? (
              <button
              onClick={startCamera}
              className="w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
            >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={solveQuestion}
                  disabled={isProcessing}
                  className="w-full sm:w-auto 
             bg-blue-500 hover:bg-blue-600 text-white 
             px-6 py-2 
             text-sm 
             rounded-full 
             font-semibold 
             flex items-center justify-center gap-2 
             transition-colors 
             disabled:opacity-50 
             whitespace-nowrap"
                >
                  <Lightbulb className="w-5 h-5" />
                  {isProcessing ? "Processing..." : "Solve Question"}
                </button>

                <button
                  onClick={stopCamera}
                  className="w-full sm:w-auto 
                   bg-gradient-to-r from-red-500 to-rose-500 
                   text-white 
                   px-6 py-2 
                   text-sm 
                   rounded-full 
                   font-semibold 
                   flex items-center justify-center gap-2 
                   hover:shadow-lg 
                   transition-all 
                   whitespace-nowrap"
                >
                  Stop Camera
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {solution && (
            <div
              className={`p-4 bg-blue-50 border border-blue-200 rounded-lg m-4 ${
                isDarkMode ? "text-black" : ""
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Solution:</h3>
              <div
                dangerouslySetInnerHTML={{ __html: solution }}
                className="custom-paragraph-spacing"
              />
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: "Multiple Languages",
              description: "Support for Hindi, English, and regional languages",
              icon: "🗣️",
            },
            {
              title: "Step-by-Step Solutions",
              description: "Detailed explanations with context",
              icon: "📝",
            },
            {
              title: "24/7 Availability",
              description: "Learn anytime, anywhere at your convenience",
              icon: "⏰",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  isDarkMode ? "text-black" : ""
                }`}
              >
                {feature.title}
              </h3>
              <p className={`opacity-80 ${isDarkMode ? "text-black" : ""}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/80">Learn Without Limits</p>
        </div>
      </footer>
    </div>
  );
};

export default LearningAssistant;
