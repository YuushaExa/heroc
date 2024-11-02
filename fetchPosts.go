package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "os"
    "path/filepath"
    "time"
)

type Post struct {
    Title   string `json:"title"`
    Content string `json:"content"`
    Date    string `json:"date"`
    Folder  string `json:"folder"`
}

func generateFakePost(index int) Post {
    title := fmt.Sprintf("Fake Post %d", index)
    content := fmt.Sprintf("This is the content of fake post number %d.", index)
    date := time.Now().Format(time.RFC3339)
    return Post{Title: title, Content: content, Date: date, Folder: "fake"}
}

func main() {
    startTime := time.Now()
    postsDirPath := "./posts" // Directory containing JSON and MD files

    // Create the posts directory if it doesn't exist
    os.MkdirAll(postsDirPath, os.ModePerm)

    // Generate fake posts
    numFakePosts := 500000 // Number of fake posts to create
    for i := 1; i <= numFakePosts; i++ {
        // Create a fake post
        post := generateFakePost(i)

        // Save as JSON
        jsonFilePath := filepath.Join(postsDirPath, fmt.Sprintf("post_%d.json", i))
        jsonData, _ := json.Marshal([]Post{post})
        ioutil.WriteFile(jsonFilePath, jsonData, 0644)

        // Save as Markdown
        mdFilePath := filepath.Join(postsDirPath, fmt.Sprintf("post_%d.md", i))
        mdContent := fmt.Sprintf("# %s\n\n%s", post.Title, post.Content)
        ioutil.WriteFile(mdFilePath, []byte(mdContent), 0644)
    }

    // For demonstration, we will just print the number of posts created
    fmt.Printf("Created %d fake posts.\n", numFakePosts)

    // After processing all posts, log the statistics
    fmt.Println("--- Build Statistics ---")
    fmt.Printf("Total Build Time: %v\n", time.Since(startTime))
}
