package main

import (
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "html/template"
    "io/ioutil"
    "os"
    "path/filepath"
    "strings"
    "sync"
    "time"
)

type Post struct {
    Title   string `json:"title"`
    Content string `json:"content"`
    Date    string `json:"date"`
    Folder  string `json:"folder"`
}

var htmlTemplate = template.Must(template.New("post").Parse(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{.Title}}</title>
</head>
<body>
    <h1>{{.Title}}</h1>
    <div>{{.Content}}</div>
</body>
</html>
`))

func main() {
    startTime := time.Now()
    postsDirPath := "./posts"
    outputDir := "./public"

    os.MkdirAll(outputDir, os.ModePerm)

    var paths []string
    err := filepath.Walk(postsDirPath, func(path string, info os.FileInfo, err error) error {
        if err != nil || info.IsDir() {
            return err
        }
        paths = append(paths, path)
        return nil
    })

    if err != nil {
        fmt.Println("Error walking directory:", err)
        return
    }

    processFiles(paths, outputDir)

    fmt.Printf("Total Build Time: %v\n", time.Since(startTime))
}

func processFiles(paths []string, outputDir string) {
    var wg sync.WaitGroup
    sem := make(chan struct{}, 10) // Limit concurrency to 10 goroutines

    for _, path := range paths {
        sem <- struct{}{} // Acquire semaphore
        wg.Add(1)
        go func(path string) {
            defer wg.Done()
            defer func() { <-sem }() // Release semaphore

            processFile(path, outputDir)
        }(path)
    }

    wg.Wait()
}

func processFile(path string, outputDir string) {
    data, err := ioutil.ReadFile(path)
    if err != nil {
        fmt.Println("Error reading file:", err)
        return
    }

    folder := filepath.Dir(path)
    ext := filepath.Ext(path)
    fileName := strings.TrimSuffix(filepath.Base(path), ext)

    var post Post
    switch ext {
    case ".json":
        var posts []Post
        if err := json.Unmarshal(data, &posts); err != nil {
            fmt.Println("Error parsing JSON:", err)
            return
        }
        for _, p := range posts {
            p.Folder = folder
            generateHTML(p, outputDir)
        }
    case ".md":
        post.Title = fileName
        post.Content = string(data)
        post.Date = time.Now().Format(time.RFC3339)
        post.Folder = folder
        generateHTML(post, outputDir)
    }
}

func generateHTML(post Post, outputDir string) {
    uniqueFileName := generateUniqueFilename(post.Title)
    folderPath := filepath.Join(outputDir, post.Folder)
    os.MkdirAll(folderPath, os.ModePerm)

    filePath := filepath.Join(folderPath, uniqueFileName)
    file, err := os.Create(filePath)
    if err != nil {
        fmt.Println("Error creating file:", err)
        return
    }
    defer file.Close()

    if err := htmlTemplate.Execute(file, post); err != nil {
        fmt.Println("Error executing template:", err)
        return
    }

    fmt.Println("Created post:", filepath.Join(post.Folder, uniqueFileName))
}

func generateUniqueFilename(title string) string {
    hash := sha256.Sum256([]byte(title))
    return hex.EncodeToString(hash[:]) + ".html"
}
