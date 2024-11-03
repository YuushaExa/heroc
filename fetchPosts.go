package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "os"
    "path/filepath"
    "strings"
    "time"
)

type Post struct {
    Content string `json:"content"`
}

func main() {
    startTime := time.Now()
    postsDirPath := "./posts" // Directory containing JSON and MD files
    outputDir := "./public"    // Output directory for generated files

    allPosts := []Post{}
    totalPages := 0

    err := filepath.Walk(postsDirPath, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }

        if info.IsDir() {
            return nil
        }

        switch {
        case strings.HasSuffix(info.Name(), ".json"):
            // Read and parse JSON files
            data, err := ioutil.ReadFile(path)
            if err != nil {
                return err
            }
            var posts []Post
            err = json.Unmarshal(data, &posts)
            if err != nil {
                return err
            }
            allPosts = append(allPosts, posts...)
            totalPages += len(posts)

        case strings.HasSuffix(info.Name(), ".md"):
            // Read Markdown files
            data, err := ioutil.ReadFile(path)
            if err != nil {
                return err
            }
            content := string(data) // Use the raw content of the Markdown file
            allPosts = append(allPosts, Post{Content: content})
            totalPages++

        default:
            // Ignore other file types
        }
        return nil
    })

    if err != nil {
        fmt.Println("Error:", err)
        return
    }

    // Create output directory
    os.MkdirAll(outputDir, os.ModePerm)

    for i, post := range allPosts {
        // Use an incrementing counter for the post title
        fileName := fmt.Sprintf("post-%d.txt", i+1) // Output as .txt files

        filePath := filepath.Join(outputDir, fileName)

        // Write only the raw content to the file
        err := ioutil.WriteFile(filePath, []byte(post.Content), 0644)
        if err != nil {
            fmt.Println("Error writing file:", err)
            return
        }
    }

    // After processing all posts, log the statistics
    fmt.Println("--- Build Statistics ---")
    fmt.Printf("Total Pages: %d\n", totalPages)
    fmt.Printf("Total Build Time: %v\n", time.Since(startTime))
}
