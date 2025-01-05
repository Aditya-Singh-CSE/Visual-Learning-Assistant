package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	ServerPort   string `json:"server_port"`
	GeminiAPIKey string `json:"gemini_api_key"`
}

// LoadConfig reads config.json from a known location and unmarshals into the Config struct.
func LoadConfig(configPath string) (*Config, error) {
	// Open the file
	file, err := os.Open(filepath.Clean(configPath))
	if err != nil {
		return nil, fmt.Errorf("cannot open config file: %w", err)
	}
	defer file.Close()

	// Decode JSON into Config
	var cfg Config
	if err := json.NewDecoder(file).Decode(&cfg); err != nil {
		return nil, fmt.Errorf("cannot decode config file: %w", err)
	}

	// Basic sanity checks
	if cfg.ServerPort == "" {
		return nil, fmt.Errorf("server_port must be specified in config")
	}
	if cfg.GeminiAPIKey == "" {
		return nil, fmt.Errorf("gemini_api_key must be specified in config")
	}

	return &cfg, nil
}
