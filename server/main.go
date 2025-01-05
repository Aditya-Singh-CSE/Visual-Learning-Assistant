package main

import (
	"log"
	"os"
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
	//p.Use(cors.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://jade-puppy-e1cab9.netlify.app/,http://localhost:5173",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Content-Type, Accept",
	}))

	// 4) Create your Gemini handler, passing in the config
	geminiHandler := handler.NewGeminiHandler(cfg)

	// 5) Register routes
	app.Post("/generate-solution", geminiHandler.GenerateSolutionHandler)
	app.Options("/generate-solution", geminiHandler.GenerateSolutionHandler)

	// Readiness check endpoint
	app.Get("/readiness", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port := 8080
		//TBD check port
		log.Print("defaulting to port ", port)

	}

	port = ":" + port
	// 6) Start the server on the configured port
	log.Printf("Starting server on %s", port)
	if err := app.Listen(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
