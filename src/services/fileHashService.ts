export interface FileHashInfo {
  hash: string;
  fileName: string;
  fileSize: number;
  lastModified: number;
}

export class FileHashService {
  async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async getFileInfo(file: File): Promise<FileHashInfo> {
    const hash = await this.calculateFileHash(file);
    return {
      hash,
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified
    };
  }

  async findDuplicates(files: File[]): Promise<Map<string, File[]>> {
    const duplicateMap = new Map<string, File[]>();
    const hashMap = new Map<string, File[]>();

    for (const file of files) {
      const hash = await this.calculateFileHash(file);

      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }

      hashMap.get(hash)!.push(file);
    }

    for (const [hash, filesList] of hashMap.entries()) {
      if (filesList.length > 1) {
        duplicateMap.set(hash, filesList);
      }
    }

    return duplicateMap;
  }

  isSimilarFileName(name1: string, name2: string): boolean {
    const normalize = (name: string) => {
      return name
        .toLowerCase()
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-z0-9]/g, '');
    };

    return normalize(name1) === normalize(name2);
  }
}

export const fileHashService = new FileHashService();
