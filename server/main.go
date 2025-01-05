package main

import (
	"log"
	"vidya-saathi/internal/handler"

	"vidya-saathi/config"

	"github.com/gofiber/fiber/v2"

	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/joho/godotenv/autoload" // load .env file automatically
)

func main() {
	// 1) Load config from config file
	cfg, err := config.LoadConfig("config/config.json")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2) Create a new Fiber instance
	app := fiber.New()

	// ---------------------------
	// 3Default CORS Middleware
	// ---------------------------
	// By default, the CORS middleware will allow all origins and headers:
	//
	app.Use(cors.New())

	// app.Use(cors.New(cors.Config{
	// 	AllowOrigins: "http://localhost:3000, https://example.com",
	// 	AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	// }))

	// 4) Create your Gemini handler, passing in the config
	geminiHandler := handler.NewGeminiHandler(cfg)

	// 5) Register routes
	app.Post("/generate-solution", geminiHandler.GenerateSolutionHandler)

	// 6) Start the server on the configured port
	log.Printf("Starting server on %s", cfg.ServerPort)
	if err := app.Listen(cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
