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
    Date    string `json:"date"`
    Folder  string `json:"folder"`
}

func main() {
    startTime := time.Now()
    postsDirPath := "./posts" // Directory containing JSON and MD files
    outputDir := "./public"    // Output directory for generated files

    allPosts := []Post{}
    totalPages := 0
    nonPageFiles := 0
    staticFiles := 0

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
            folder := filepath.Dir(path)
            for i := range posts {
                posts[i].Folder = folder
                allPosts = append(allPosts, posts[i])
            }
            totalPages += len(posts)
            nonPageFiles++

        case strings.HasSuffix(info.Name(), ".md"):
            // Read Markdown files
            data, err := ioutil.ReadFile(path)
            if err != nil {
                return err
            }
            folder := filepath.Dir(path)
            date := time.Now().Format(time.RFC3339)
            content := string(data) // Use the raw content of the Markdown file
            allPosts = append(allPosts, Post{Content: content, Date: date, Folder: folder})
            totalPages++

        default:
            staticFiles++
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
        postTitle := fmt.Sprintf("Post %d", i+1) // Title as "Post X"
        baseFileName := strings.ToLower(strings.ReplaceAll(postTitle, " ", "-"))
        fileName := fmt.Sprintf("%s.txt", baseFileName) // Change to .txt for raw content

        folderPath := filepath.Join(outputDir, post.Folder)
        os.MkdirAll(folderPath, os.ModePerm)

        filePath := filepath.Join(folderPath, fileName)

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
    fmt.Printf("Non-page Files: %d\n", nonPageFiles)
    fmt.Printf("Static Files: %d\n", staticFiles)
    fmt.Printf("Total Build Time: %v\n", time.Since(startTime))
}
