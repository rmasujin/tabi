(function() {
  'use strict';

  // 設定
  const REPO = 'rmasujin/tabi';
  const BRANCH = 'main';
  const DATA_PATH = 'data/posts-data.json';

  // 状態
  let postsData = { posts: [] };
  let selectedFiles = [];
  let githubToken = localStorage.getItem('githubToken') || '';

  // 初期化
  async function init() {
    // トークンを読み込み
    if (githubToken) {
      document.getElementById('githubToken').value = githubToken;
    }

    // イベントリスナー
    document.getElementById('githubToken').addEventListener('change', saveToken);
    document.getElementById('fileUploadArea').addEventListener('click', () => {
      document.getElementById('imageInput').click();
    });
    document.getElementById('imageInput').addEventListener('change', handleFileSelect);
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    document.getElementById('resetFormBtn').addEventListener('click', resetForm);

    // 投稿データを読み込み
    await loadPostsData();
    renderPostsList();
  }

  // GitHub Tokenを保存
  function saveToken(e) {
    githubToken = e.target.value;
    localStorage.setItem('githubToken', githubToken);
    showStatus('トークンを保存しました', 'success');
  }

  // 投稿データを読み込み
  async function loadPostsData() {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_PATH}`);
      postsData = await response.json();
    } catch (error) {
      console.log('投稿データが見つかりません。新規作成します。');
      postsData = { posts: [] };
    }
  }

  // ファイル選択
  async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    selectedFiles = [];

    for (const file of files) {
      const optimized = await optimizeImage(file);
      selectedFiles.push(optimized);
    }

    renderPreview();
  }

  // 画像を最適化
  async function optimizeImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Canvas でリサイズ
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 最大幅を1200pxに制限
          const maxWidth = 1200;
          const scale = Math.min(1, maxWidth / img.width);

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // JPEG 85%品質で圧縮
          canvas.toBlob((blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            // サイズ情報を表示
            const originalSize = (file.size / 1024 / 1024).toFixed(2);
            const optimizedSize = (optimizedFile.size / 1024 / 1024).toFixed(2);
            const reduction = ((1 - optimizedFile.size / file.size) * 100).toFixed(0);

            document.getElementById('optimizeInfo').style.display = 'block';
            document.getElementById('optimizeInfo').textContent =
              `最適化完了: ${originalSize}MB → ${optimizedSize}MB (${reduction}%削減)`;

            resolve({
              file: optimizedFile,
              preview: canvas.toDataURL('image/jpeg', 0.85)
            });
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // プレビュー表示
  function renderPreview() {
    const container = document.getElementById('previewImages');
    container.innerHTML = '';

    selectedFiles.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${item.preview}">
        <button class="remove-btn" data-index="${index}">×</button>
      `;
      container.appendChild(div);
    });

    // 削除ボタン
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedFiles.splice(index, 1);
        renderPreview();
      });
    });
  }

  // 投稿を作成
  async function createPost() {
    if (!githubToken) {
      showStatus('GitHub Tokenを設定してください', 'error');
      return;
    }

    if (selectedFiles.length === 0) {
      showStatus('画像を選択してください', 'error');
      return;
    }

    const fullContent = document.getElementById('postContent').value;
    if (!fullContent) {
      showStatus('投稿内容を入力してください', 'error');
      return;
    }

    // 改行で分割して、2行以上なら自動的に「続きを読む」に分ける
    const lines = fullContent.split('\n');
    const content = lines[0]; // 最初の1行
    const contentMore = lines.length > 1 ? lines.slice(1).join('\n') : ''; // 2行目以降

    showStatus('アップロード中...', 'success');

    try {
      // 1. 画像をアップロード
      const author = document.getElementById('author').value;
      const folder = author === 'both' ? 'shared' : author;
      const uploadedImages = [];

      for (const item of selectedFiles) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${item.file.name}`;
        const path = `assets/posts/${folder}/${filename}`;

        await uploadToGitHub(item.file, path);
        uploadedImages.push(path);
      }

      // 2. 投稿データを作成
      const newPost = {
        id: postsData.posts.length > 0 ? Math.max(...postsData.posts.map(p => p.id)) + 1 : 1,
        number: String(postsData.posts.length + 1).padStart(2, '0'),
        date: document.getElementById('postDate').value,
        author: author,
        authorDisplay: author === 'both' ? 'RIKI ＋ KANAMI' :
                       author === 'riki' ? 'RIKI' : 'KANAMI',
        category: [
          document.getElementById('categoryPosts').checked ? 'posts' : null,
          document.getElementById('categoryFavorites').checked ? 'favorites' : null
        ].filter(Boolean),
        displayIn: {
          home: document.getElementById('categoryPosts').checked,
          kanamiPosts: author === 'kanami' || author === 'both',
          rikiPosts: author === 'riki' || author === 'both',
          kanamiFavorites: author === 'kanami' && document.getElementById('categoryFavorites').checked,
          rikiFavorites: author === 'riki' && document.getElementById('categoryFavorites').checked
        },
        images: uploadedImages,
        content: content,
        contentMore: contentMore
      };

      // 3. JSONファイルを更新
      postsData.posts.push(newPost);
      await updatePostsJSON();

      showStatus('投稿を作成しました！', 'success');
      resetForm();
      renderPostsList();

    } catch (error) {
      showStatus('エラーが発生しました: ' + error.message, 'error');
      console.error(error);
    }
  }

  // GitHubにファイルをアップロード
  async function uploadToGitHub(file, path) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const content = e.target.result.split(',')[1]; // Base64部分

        const response = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `画像を追加: ${path}`,
              content: content,
              branch: BRANCH
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          reject(new Error(error.message));
        } else {
          resolve();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // JSONファイルを更新
  async function updatePostsJSON() {
    // 既存のファイル情報を取得（SHA取得のため）
    let sha = null;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`
          }
        }
      );
      const data = await response.json();
      sha = data.sha;
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    // JSONを更新
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(postsData, null, 2))));

    const body = {
      message: '投稿データを更新',
      content: content,
      branch: BRANCH
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  }

  // 投稿一覧を表示
  function renderPostsList() {
    const container = document.getElementById('postsContainer');

    if (postsData.posts.length === 0) {
      container.innerHTML = '<p style="color: #666;">投稿がまだありません</p>';
      return;
    }

    container.innerHTML = '';

    postsData.posts.sort((a, b) => b.id - a.id).forEach(post => {
      const div = document.createElement('div');
      div.className = 'post-item';
      div.innerHTML = `
        <img src="${post.images[0]}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/></svg>'">
        <div class="post-info">
          <h3>${post.number}. ${post.authorDisplay}</h3>
          <p>📅 ${post.date}</p>
          <p>📷 ${post.images.length}枚の画像</p>
          <p>${post.content.substring(0, 50)}...</p>
        </div>
        <div class="post-actions">
          <button class="edit-btn" data-id="${post.id}">編集</button>
          <button class="delete-btn" data-id="${post.id}">削除</button>
        </div>
      `;
      container.appendChild(div);
    });

    // 削除ボタン
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        if (confirm('本当に削除しますか？')) {
          await deletePost(id);
        }
      });
    });
  }

  // 投稿を削除
  async function deletePost(id) {
    const post = postsData.posts.find(p => p.id === id);
    if (!post) return;

    showStatus('削除中...', 'success');

    try {
      // 画像を削除
      for (const imagePath of post.images) {
        await deleteFromGitHub(imagePath);
      }

      // JSONから削除
      postsData.posts = postsData.posts.filter(p => p.id !== id);
      await updatePostsJSON();

      showStatus('削除しました', 'success');
      renderPostsList();

    } catch (error) {
      showStatus('削除に失敗しました: ' + error.message, 'error');
    }
  }

  // GitHubからファイルを削除
  async function deleteFromGitHub(path) {
    // ファイル情報を取得
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`
        }
      }
    );
    const data = await response.json();

    // 削除
    await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `画像を削除: ${path}`,
          sha: data.sha,
          branch: BRANCH
        })
      }
    );
  }

  // フォームをリセット
  function resetForm() {
    document.getElementById('postDate').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('imageInput').value = '';
    selectedFiles = [];
    document.getElementById('previewImages').innerHTML = '';
    document.getElementById('optimizeInfo').style.display = 'none';
  }

  // ステータスメッセージを表示
  function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;

    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    }
  }

  // 起動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
