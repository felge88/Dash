import database from "@/lib/database";
import path from "path";
import fs from "fs";

export interface YouTubeDownload {
  id: number;
  user_id: number;
  title: string;
  url: string;
  format: "mp3" | "mp4" | "wav" | "flac";
  status: "pending" | "downloading" | "completed" | "error";
  progress: number;
  file_path?: string;
  file_size?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DownloadRequest {
  urls: string[];
  format: "mp3" | "mp4" | "wav" | "flac";
}

export class YouTubeService {
  private static instance: YouTubeService;
  private downloadsDir = path.join(process.cwd(), "uploads", "youtube");

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = [
      this.downloadsDir,
      path.join(this.downloadsDir, "mp3"),
      path.join(this.downloadsDir, "mp4"),
      path.join(this.downloadsDir, "wav"),
      path.join(this.downloadsDir, "flac"),
      path.join(this.downloadsDir, "temp"),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initiateDownload(
    userId: number,
    request: DownloadRequest
  ): Promise<{ success: boolean; downloads?: number[]; message?: string }> {
    try {
      const downloadIds: number[] = [];

      for (const url of request.urls) {
        // Validate URL
        if (!this.isValidYouTubeURL(url) && !this.isSearchQuery(url)) {
          continue;
        }

        // Extract or generate title
        const title = await this.extractTitle(url);

        // Create download record
        const result = await database.run(
          `INSERT INTO youtube_downloads (user_id, title, url, format, status, progress) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, title, url, request.format, "pending", 0]
        );

        downloadIds.push(result.lastID);

        // Start download process in background
        this.processDownload(result.lastID, userId, url, title, request.format);
      }

      await database.logActivity(
        userId,
        "youtube",
        "download_initiated",
        "success",
        `Initiated ${downloadIds.length} download(s)`,
        { download_ids: downloadIds, format: request.format }
      );

      return { success: true, downloads: downloadIds };
    } catch (error) {
      console.error("YouTube download initiation error:", error);
      return { success: false, message: "Failed to initiate downloads" };
    }
  }

  async getDownloads(
    userId: number,
    status?: string
  ): Promise<YouTubeDownload[]> {
    try {
      let query = "SELECT * FROM youtube_downloads WHERE user_id = ?";
      const params: any[] = [userId];

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY created_at DESC";

      const downloads = await database.all(query, params);
      return downloads;
    } catch (error) {
      console.error("Get YouTube downloads error:", error);
      return [];
    }
  }

  async deleteDownload(
    userId: number,
    downloadId: number
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Get download info
      const download = await database.get(
        "SELECT * FROM youtube_downloads WHERE id = ? AND user_id = ?",
        [downloadId, userId]
      );

      if (!download) {
        return { success: false, message: "Download not found" };
      }

      // Delete file if exists
      if (download.file_path && fs.existsSync(download.file_path)) {
        fs.unlinkSync(download.file_path);
      }

      // Delete from database
      await database.run(
        "DELETE FROM youtube_downloads WHERE id = ? AND user_id = ?",
        [downloadId, userId]
      );

      await database.logActivity(
        userId,
        "youtube",
        "download_deleted",
        "success",
        `Deleted download: ${download.title}`,
        { download_id: downloadId }
      );

      return { success: true };
    } catch (error) {
      console.error("Delete YouTube download error:", error);
      return { success: false, message: "Failed to delete download" };
    }
  }

  async getDownloadFile(
    userId: number,
    downloadId: number
  ): Promise<{
    success: boolean;
    filePath?: string;
    fileName?: string;
    message?: string;
  }> {
    try {
      const download = await database.get(
        "SELECT * FROM youtube_downloads WHERE id = ? AND user_id = ? AND status = ?",
        [downloadId, userId, "completed"]
      );

      if (!download) {
        return {
          success: false,
          message: "Download not found or not completed",
        };
      }

      if (!download.file_path || !fs.existsSync(download.file_path)) {
        return { success: false, message: "File not found" };
      }

      return {
        success: true,
        filePath: download.file_path,
        fileName: path.basename(download.file_path),
      };
    } catch (error) {
      console.error("Get download file error:", error);
      return { success: false, message: "Failed to get file" };
    }
  }

  async getStorageStats(
    userId: number
  ): Promise<{
    totalFiles: number;
    storageUsed: string;
    downloadsByFormat: any;
  }> {
    try {
      const stats = await database.all(
        `SELECT format, COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size 
         FROM youtube_downloads 
         WHERE user_id = ? AND status = 'completed' 
         GROUP BY format`,
        [userId]
      );

      const totalFiles = stats.reduce((sum, stat) => sum + stat.count, 0);
      const totalSize = stats.reduce((sum, stat) => sum + stat.total_size, 0);
      const storageUsed = this.formatFileSize(totalSize);

      const downloadsByFormat = stats.reduce((obj, stat) => {
        obj[stat.format] = {
          count: stat.count,
          size: this.formatFileSize(stat.total_size),
        };
        return obj;
      }, {});

      return { totalFiles, storageUsed, downloadsByFormat };
    } catch (error) {
      console.error("Get storage stats error:", error);
      return { totalFiles: 0, storageUsed: "0 B", downloadsByFormat: {} };
    }
  }

  private async processDownload(
    downloadId: number,
    userId: number,
    url: string,
    title: string,
    format: string
  ) {
    try {
      // Update status to downloading
      await database.run(
        "UPDATE youtube_downloads SET status = ?, progress = ? WHERE id = ?",
        ["downloading", 10, downloadId]
      );

      // Simulate download process (replace with actual ytdl-core implementation)
      await this.simulateDownload(downloadId, userId, url, title, format);
    } catch (error) {
      console.error("Download process error:", error);

      // Update status to error
      await database.run(
        "UPDATE youtube_downloads SET status = ?, error_message = ? WHERE id = ?",
        [
          "error",
          error instanceof Error ? error.message : "Unknown error",
          downloadId,
        ]
      );

      await database.logActivity(
        userId,
        "youtube",
        "download_failed",
        "error",
        `Download failed: ${title}`,
        {
          download_id: downloadId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  }

  private async simulateDownload(
    downloadId: number,
    userId: number,
    url: string,
    title: string,
    format: string
  ) {
    // This is a simulation - replace with actual ytdl-core implementation
    const steps = [20, 40, 60, 80, 100];

    for (const progress of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate time

      await database.run(
        "UPDATE youtube_downloads SET progress = ? WHERE id = ?",
        [progress, downloadId]
      );
    }

    // Generate mock file
    const fileName = `${this.sanitizeFilename(title)}.${format}`;
    const filePath = path.join(this.downloadsDir, format, fileName);

    // Create mock file
    const mockContent = `Mock ${format.toUpperCase()} file for: ${title}\nURL: ${url}\nGenerated: ${new Date().toISOString()}`;
    fs.writeFileSync(filePath, mockContent);

    const fileSize = fs.statSync(filePath).size;

    // Update as completed
    await database.run(
      `UPDATE youtube_downloads 
       SET status = ?, progress = ?, file_path = ?, file_size = ?, completed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      ["completed", 100, filePath, fileSize, downloadId]
    );

    await database.logActivity(
      userId,
      "youtube",
      "download_completed",
      "success",
      `Download completed: ${title}`,
      { download_id: downloadId, format, file_size: fileSize }
    );
  }

  private isValidYouTubeURL(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  }

  private isSearchQuery(query: string): boolean {
    // If it's not a URL, treat it as a search query
    return !query.startsWith("http") && query.length > 0;
  }

  private async extractTitle(url: string): Promise<string> {
    if (this.isSearchQuery(url)) {
      return url; // Use the search query as title
    }

    // In a real implementation, you would extract the actual title from YouTube
    // For now, return a mock title
    return `Video from ${url.split("/").pop() || "YouTube"}`;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .substring(0, 100); // Limit length
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

export default YouTubeService.getInstance();
