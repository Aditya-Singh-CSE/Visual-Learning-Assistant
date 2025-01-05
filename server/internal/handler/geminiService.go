package handler

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"vidya-saathi/config"

	"github.com/gofiber/fiber/v2"
)

// GeminiHandler holds references to dependencies we need (e.g., config)
type GeminiHandler struct {
	Config *config.Config
}

// NewGeminiHandler is a constructor-like function for GeminiHandler
func NewGeminiHandler(cfg *config.Config) *GeminiHandler {
	return &GeminiHandler{Config: cfg}
}

// RequestPayload represents the JSON structure from the client
// (e.g., { "data": "<base64_encoded_image>" }).
type RequestPayload struct {
	Data string `json:"data"`
}

// GeminiResponse represents the structure of the Gemini API response.
// Adjust these fields to match the actual response you get from the API.
type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

// GenerateSolutionHandler handles the request:
// 1) Decode the base64 image
// 2) Call the Gemini API with the inline image data
// 3) Return the Gemini response to the client.
func (h *GeminiHandler) GenerateSolutionHandler(c *fiber.Ctx) error {
	// Parse the incoming JSON body into our RequestPayload
	var payload RequestPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON body",
		})
	}

	// Decode the base64 string to confirm it’s valid.
	// (This step is optional if you only need to pass it through.)
	_, err := base64.StdEncoding.DecodeString(payload.Data)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":  "Invalid base64 data",
			"detail": err.Error(),
		})
	}

	// 1) Build the Gemini API request payload
	geminiPayload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{
						"text": "Please analyze this image and provide a detailed solution in HTML format. Include step-by-step explanations and in proper paragraphs. Use proper HTML tags for formatting.",
					},
					{
						"inline_data": map[string]interface{}{
							"mime_type": "image/jpeg",
							"data":      payload.Data, // or string(decodedBytes) if needed
						},
					},
				},
			},
		},
	}

	// Marshal the payload to JSON
	requestBody, err := json.Marshal(geminiPayload)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "Failed to marshal Gemini payload",
			"detail": err.Error(),
		})
	}

	// ------------------------------------------------------------
	// 2) Send HTTP request to the Gemini API
	// ------------------------------------------------------------
	// Suppose your endpoint is:
	// https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY
	// You could store the API key in an environment variable for security
	// rather than hardcoding it.
	// ------------------------------------------------------------

	//apiKey := os.Getenv("GEMINI_API_KEY") // e.g., "AIzaSy...."
	apiKey := h.Config.GeminiAPIKey
	if apiKey == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "GEMINI_API_KEY environment variable not set",
		})
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", apiKey)

	// Create an HTTP client
	client := &http.Client{
		Timeout: 15 * time.Second, // Set a timeout
	}

	// Build the request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "Failed to create Gemini API request",
			"detail": err.Error(),
		})
	}
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error":  "Gemini API request failed",
			"detail": err.Error(),
		})
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error":  "Gemini API returned non-2xx status",
			"status": resp.StatusCode,
		})
	}

	// Parse the Gemini API response
	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error":  "Failed to decode Gemini API response",
			"detail": err.Error(),
		})
	}

	// ------------------------------------------------------------
	// 3) Extract the text from the first candidate (if available)
	// ------------------------------------------------------------
	var solutionText string
	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		solutionText = geminiResp.Candidates[0].Content.Parts[0].Text
	} else {
		solutionText = "No content returned from Gemini API."
	}

	// Return the solution to the client
	return c.JSON(fiber.Map{
		"solution": solutionText,
	})
}
