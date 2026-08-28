(function() {
  'use strict';

  // 設定
  const REPO = 'rmasujin/tabi';
  const BRANCH = 'main';
  const DATA_PATH = 'data/posts-data.json';
  const PROFILE_DATA_PATH = 'data/profile-data.json';
  const SEATING_DATA_PATH = 'data/seating-data.json';

  // 状態
  let postsData = { posts: [] };
  let profileData = {};
  let seatingData = {};
  let selectedFiles = [];
  let selectedKanamiAvatar = null;
  let selectedRikiAvatar = null;
  let selectedTableId = null; // 現在選択されているテーブルID
  let githubToken = localStorage.getItem('githubToken') || '';

  // 初期化
  async function init() {
    // トークンを読み込み
    if (githubToken) {
      document.getElementById('githubToken').value = githubToken;
    }

    // タブ切り替え
    setupTabs();

    // 投稿管理のイベントリスナー
    document.getElementById('githubToken').addEventListener('change', saveToken);
    document.getElementById('fileUploadArea').addEventListener('click', () => {
      document.getElementById('imageInput').click();
    });
    document.getElementById('imageInput').addEventListener('change', handleFileSelect);
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    document.getElementById('resetFormBtn').addEventListener('click', resetForm);

    // プロフィール管理のイベントリスナー
    // アバター画像のイベントリスナーは動的に設定されるため、ここでは不要
    document.getElementById('saveKanamiProfileBtn').addEventListener('click', () => saveProfile('kanami'));
    document.getElementById('saveRikiProfileBtn').addEventListener('click', () => saveProfile('riki'));
    document.getElementById('addKanamiDetailBtn').addEventListener('click', () => addDetailItem('kanami'));
    document.getElementById('addRikiDetailBtn').addEventListener('click', () => addDetailItem('riki'));

    // 席次表管理のイベントリスナー
    document.getElementById('selectedTableUploadArea').addEventListener('click', () => {
      document.getElementById('selectedTableInput').click();
    });
    document.getElementById('selectedTableInput').addEventListener('change', handleTableImageSelect);
    document.getElementById('saveSeatingBtn').addEventListener('click', saveSeating);

    // データを読み込み
    await loadPostsData();
    await loadProfileData();
    await loadSeatingData();
    renderPostsList();
    renderProfileForms();
  }

  // タブ切り替え
  function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // タブのアクティブ状態を切り替え
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // コンテンツの表示を切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(`tab-${targetTab}`).classList.add('active');

        // プロフィールタブに切り替えた時はフォームを再描画
        if (targetTab === 'profile') {
          renderProfileForms();
        }
      });
    });
  }

  // GitHub Tokenを保存
  function saveToken(e) {
    githubToken = e.target.value;
    localStorage.setItem('githubToken', githubToken);
    showStatus('✅ トークンを保存しました', 'success');
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

    // 改行で分割して、3行以上なら自動的に「続きを読む」に分ける
    const lines = fullContent.split('\n');
    const content = lines.slice(0, 2).join('\n'); // 最初の2行
    const contentMore = lines.length > 2 ? lines.slice(2).join('\n') : ''; // 3行目以降

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

      showStatus('✅ 投稿を作成しました！', 'success');
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

      showStatus('✅ 削除しました', 'success');
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
    statusEl.style.display = 'block';

    // 既存のタイマーをクリア
    if (statusEl.timeout) {
      clearTimeout(statusEl.timeout);
    }

    // 成功メッセージは5秒後に自動で消える
    if (type === 'success') {
      statusEl.timeout = setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }

  // プロフィールデータを読み込み
  async function loadProfileData() {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${PROFILE_DATA_PATH}`);
      profileData = await response.json();
      console.log('Profile data loaded:', profileData);
    } catch (error) {
      console.log('プロフィールデータが見つかりません。');
      profileData = {
        kanami: { name: 'KANAMI', avatar: '', bio: '', details: [] },
        riki: { name: 'RIKI', avatar: '', bio: '', details: [] }
      };
    }
  }

  // 席次表データを読み込み
  async function loadSeatingData() {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SEATING_DATA_PATH}`);
      seatingData = await response.json();
      console.log('Seating data loaded:', seatingData);
    } catch (error) {
      console.log('席次表データが見つかりません。');
      seatingData = { tables: [] };
    }
    renderTables();
  }

  // プロフィールフォームを描画
  function renderProfileForms() {
    if (profileData.kanami) {
      document.getElementById('kanamiAccountName').value = profileData.kanami.accountName || 'KANAMI';
      document.getElementById('kanamiFullName').value = profileData.kanami.fullName || '';
      document.getElementById('kanamiBio').value = profileData.kanami.bio || '';
      renderDetailItems('kanami');
      renderAvatarPreview('kanami');
    }
    if (profileData.riki) {
      document.getElementById('rikiAccountName').value = profileData.riki.accountName || 'RIKI';
      document.getElementById('rikiFullName').value = profileData.riki.fullName || '';
      document.getElementById('rikiBio').value = profileData.riki.bio || '';
      renderDetailItems('riki');
      renderAvatarPreview('riki');
    }
  }

  // アバタープレビューを描画
  function renderAvatarPreview(author) {
    const previewEl = document.getElementById(`${author}AvatarPreview`);
    const avatar = profileData[author]?.avatar;
    const selectedAvatar = author === 'kanami' ? selectedKanamiAvatar : selectedRikiAvatar;

    if (selectedAvatar) {
      // 新しく選択された画像を表示
      previewEl.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <img src="${selectedAvatar.preview}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
          <button type="button" class="remove-btn" onclick="window.removeAvatar('${author}')" style="position: absolute; top: 5px; right: 5px;">×</button>
        </div>
      `;
    } else if (avatar) {
      // 既存の画像を表示
      previewEl.innerHTML = `
        <div style="display: inline-block; text-align: center;">
          <img src="${avatar}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; display: block;">
          <button type="button" class="btn btn-secondary" onclick="window.deleteAvatar('${author}')" style="margin-top: 10px;">画像を削除</button>
        </div>
      `;
    } else {
      // 画像がない場合はアップロードエリアを表示
      previewEl.innerHTML = `
        <div class="file-upload" id="${author}AvatarUploadArea">
          <input type="file" id="${author}AvatarInput" accept="image/*">
          <p>📷 クリックして画像を選択</p>
        </div>
      `;
      // イベントリスナーを再設定
      const uploadArea = document.getElementById(`${author}AvatarUploadArea`);
      const fileInput = document.getElementById(`${author}AvatarInput`);
      if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleAvatarSelect(e, author));
      }
    }
  }

  // 選択した画像を削除（保存前）
  window.removeAvatar = function(author) {
    if (author === 'kanami') {
      selectedKanamiAvatar = null;
    } else {
      selectedRikiAvatar = null;
    }
    renderAvatarPreview(author);
  };

  // 保存済み画像を削除
  window.deleteAvatar = async function(author) {
    if (!confirm('プロフィール画像を削除しますか？')) {
      return;
    }

    if (!githubToken) {
      showStatus('GitHub Tokenを設定してください', 'error');
      return;
    }

    showStatus('削除中...', 'success');

    try {
      const avatarPath = profileData[author]?.avatar;
      if (avatarPath) {
        // GitHubから画像を削除
        await deleteFromGitHub(avatarPath);
      }

      // プロフィールデータから削除
      profileData[author].avatar = '';
      await updateProfileJSON();

      showStatus('✅ 画像を削除しました', 'success');
      renderAvatarPreview(author);

    } catch (error) {
      showStatus('削除に失敗しました: ' + error.message, 'error');
      console.error(error);
    }
  };

  // プロフィール項目を描画
  function renderDetailItems(author) {
    const container = document.getElementById(`${author}DetailsContainer`);
    container.innerHTML = '';

    const details = profileData[author]?.details || [];
    details.forEach((detail, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'detail-item';
      itemDiv.innerHTML = `
        <input type="text" placeholder="項目名（例: 年齢）" value="${detail.label}" data-author="${author}" data-index="${index}" data-field="label">
        <input type="text" placeholder="値（例: 28歳）" value="${detail.value}" data-author="${author}" data-index="${index}" data-field="value">
        <button type="button" onclick="window.removeDetailItem('${author}', ${index})">削除</button>
      `;
      container.appendChild(itemDiv);
    });
  }

  // 項目を追加
  function addDetailItem(author) {
    if (!profileData[author]) {
      profileData[author] = { name: author.toUpperCase(), avatar: '', bio: '', details: [] };
    }
    if (!profileData[author].details) {
      profileData[author].details = [];
    }

    profileData[author].details.push({ label: '', value: '' });
    renderDetailItems(author);
  }

  // 項目を削除
  window.removeDetailItem = function(author, index) {
    if (profileData[author] && profileData[author].details) {
      profileData[author].details.splice(index, 1);
      renderDetailItems(author);
    }
  };

  // 項目の値を取得
  function getDetailItems(author) {
    const container = document.getElementById(`${author}DetailsContainer`);
    const items = container.querySelectorAll('.detail-item');
    const details = [];

    items.forEach(item => {
      const labelInput = item.querySelector('[data-field="label"]');
      const valueInput = item.querySelector('[data-field="value"]');
      if (labelInput.value && valueInput.value) {
        details.push({
          label: labelInput.value,
          value: valueInput.value
        });
      }
    });

    return details;
  }

  // アバター画像選択
  async function handleAvatarSelect(e, author) {
    const file = e.target.files[0];
    if (!file) return;

    showStatus('画像を最適化中...', 'success');

    const optimized = await optimizeImage(file);

    if (author === 'kanami') {
      selectedKanamiAvatar = optimized;
    } else {
      selectedRikiAvatar = optimized;
    }

    renderAvatarPreview(author);
    showStatus('✅ 画像を選択しました（保存ボタンを押してください）', 'success');
  }

  // プロフィールを保存
  async function saveProfile(author) {
    if (!githubToken) {
      showStatus('GitHub Tokenを設定してください', 'error');
      return;
    }

    showStatus('保存中...', 'success');

    try {
      const accountName = author === 'kanami'
        ? document.getElementById('kanamiAccountName').value
        : document.getElementById('rikiAccountName').value;

      const fullName = author === 'kanami'
        ? document.getElementById('kanamiFullName').value
        : document.getElementById('rikiFullName').value;

      const bio = author === 'kanami'
        ? document.getElementById('kanamiBio').value
        : document.getElementById('rikiBio').value;

      // プロフィール項目を取得
      const details = getDetailItems(author);

      // アバター画像をアップロード（選択されている場合）
      let avatarPath = profileData[author]?.avatar || '';
      const selectedAvatar = author === 'kanami' ? selectedKanamiAvatar : selectedRikiAvatar;

      if (selectedAvatar) {
        const timestamp = Date.now();
        const filename = `avatar-${author}-${timestamp}.jpg`;
        avatarPath = `assets/${filename}`;
        await uploadToGitHub(selectedAvatar.file, avatarPath);
      }

      // プロフィールデータを更新
      profileData[author] = {
        ...profileData[author],
        accountName: accountName || (author === 'kanami' ? 'KANAMI' : 'RIKI'),
        fullName: fullName || '',
        bio: bio,
        avatar: avatarPath,
        details: details
      };

      await updateProfileJSON();

      showStatus('✅ プロフィールを保存しました！', 'success');

      // 選択をリセット
      if (author === 'kanami') {
        selectedKanamiAvatar = null;
      } else {
        selectedRikiAvatar = null;
      }

      // プロフィールフォームを再描画（保存後の画像を表示）
      renderProfileForms();

    } catch (error) {
      showStatus('エラーが発生しました: ' + error.message, 'error');
      console.error(error);
    }
  }

  // プロフィールJSONを更新
  async function updateProfileJSON() {
    let sha = null;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${PROFILE_DATA_PATH}`,
        { headers: { 'Authorization': `token ${githubToken}` } }
      );
      const data = await response.json();
      sha = data.sha;
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(profileData, null, 2))));

    const body = {
      message: 'プロフィールデータを更新',
      content: content,
      branch: BRANCH
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${PROFILE_DATA_PATH}`,
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

  // テーブルセレクターを描画（A〜K固定）
  function renderTables() {
    const selector = document.getElementById('tableSelector');
    selector.innerHTML = '';

    // A〜Kの固定テーブル
    const tableLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    if (!seatingData.tables) {
      seatingData.tables = [];
    }

    tableLabels.forEach((label) => {
      // 既存データを探す
      let table = seatingData.tables.find(t => t.id === label);
      if (!table) {
        table = { id: label, images: [] };
        seatingData.tables.push(table);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-secondary';
      button.textContent = `TABLE ${label}`;
      button.style.minWidth = '80px';

      if (selectedTableId === label) {
        button.style.background = '#D9FF1F';
        button.style.color = '#0A0A0A';
      }

      button.addEventListener('click', () => selectTable(label));
      selector.appendChild(button);
    });
  }

  // テーブルを選択
  function selectTable(tableId) {
    selectedTableId = tableId;

    // ボタンのスタイルを更新
    renderTables();

    // 選択されたテーブルエリアを表示
    const selectedArea = document.getElementById('selectedTableArea');
    selectedArea.style.display = 'block';

    // タイトルを更新
    document.getElementById('selectedTableTitle').textContent = `TABLE ${tableId} 卓`;

    // 既存の画像を表示
    const table = seatingData.tables.find(t => t.id === tableId);
    renderSelectedTablePreview(table ? table.images : []);
  }

  // 選択されたテーブルのプレビューを表示
  function renderSelectedTablePreview(existingImages = []) {
    if (!selectedTableId) return;

    const existingPreview = document.getElementById('selectedTablePreview');
    const newPreview = document.getElementById('selectedTableNewPreview');
    existingPreview.innerHTML = '';
    newPreview.innerHTML = '';

    const table = seatingData.tables.find(t => t.id === selectedTableId);
    const uploadedFiles = table?.uploadedFiles || [];

    // 既存の画像を表示（削除ボタン付き）
    if (existingImages.length > 0) {
      existingImages.forEach((src, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.style.position = 'relative';
        imgDiv.innerHTML = `
          <img src="${src}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: 4px; display: block;">
          <button class="remove-btn existing-remove" data-existing-index="${index}" style="position: absolute; top: 5px; right: 5px;">×</button>
        `;
        existingPreview.appendChild(imgDiv);
      });

      // 既存画像の削除ボタン
      existingPreview.querySelectorAll('.existing-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const index = parseInt(e.target.dataset.existingIndex);
          if (confirm('この画像を削除しますか？')) {
            await deleteTableImage(selectedTableId, index);
          }
        });
      });
    } else {
      existingPreview.innerHTML = '<p style="color: #666;">登録済みの画像はありません</p>';
    }

    // 新しくアップロードした画像を表示（保存前プレビュー）
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((item, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.style.position = 'relative';
        imgDiv.innerHTML = `
          <img src="${item.preview}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: 4px; display: block;">
          <button class="remove-btn new-remove" data-new-index="${index}" style="position: absolute; top: 5px; right: 5px;">×</button>
        `;
        newPreview.appendChild(imgDiv);
      });

      // 新規画像の削除ボタン
      newPreview.querySelectorAll('.new-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.newIndex);
          if (table && table.uploadedFiles) {
            table.uploadedFiles.splice(index, 1);
            renderSelectedTablePreview(existingImages);
          }
        });
      });
    }
  }

  // テーブル画像を削除
  async function deleteTableImage(tableId, imageIndex) {
    if (!githubToken) {
      showStatus('GitHub Tokenを設定してください', 'error');
      return;
    }

    showStatus('削除中...', 'success');

    try {
      const table = seatingData.tables.find(t => t.id === tableId);
      if (!table || !table.images || !table.images[imageIndex]) {
        throw new Error('画像が見つかりません');
      }

      const imagePath = table.images[imageIndex];

      // GitHubから画像を削除
      await deleteFromGitHub(imagePath);

      // データから削除
      table.images.splice(imageIndex, 1);
      await updateSeatingJSON();

      showStatus('✅ 画像を削除しました', 'success');

      // プレビューを再描画
      renderSelectedTablePreview(table.images || []);

    } catch (error) {
      showStatus('削除に失敗しました: ' + error.message, 'error');
      console.error(error);
    }
  }

  // テーブル画像選択（複数対応）
  async function handleTableImageSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!selectedTableId) {
      showStatus('先にテーブルを選択してください', 'error');
      return;
    }

    const table = seatingData.tables.find(t => t.id === selectedTableId);
    if (!table) return;

    showStatus('画像を最適化中...', 'success');

    // uploadedFilesを初期化
    if (!table.uploadedFiles) {
      table.uploadedFiles = [];
    }

    // 全ての画像を最適化してテーブルに追加
    for (const file of files) {
      const optimized = await optimizeImage(file);
      table.uploadedFiles.push(optimized);
    }

    // プレビュー表示を更新
    renderSelectedTablePreview(table.images || []);

    // ファイル入力をリセット
    e.target.value = '';

    showStatus('✅ 画像を追加しました', 'success');
  }

  // すべてのテーブルを保存
  async function saveSeating() {
    if (!githubToken) {
      showStatus('GitHub Tokenを設定してください', 'error');
      return;
    }

    showStatus('保存中...', 'success');

    try {
      // 各テーブルの新しい画像をアップロード
      for (const table of seatingData.tables) {
        if (table.uploadedFiles && table.uploadedFiles.length > 0) {
          if (!table.images) {
            table.images = [];
          }

          // 各画像をアップロード
          for (const uploadedFile of table.uploadedFiles) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const filename = `table-${table.id}-${timestamp}-${random}.jpg`;
            const path = `assets/seating/${filename}`;

            await uploadToGitHub(uploadedFile.file, path);
            table.images.push(path);
          }

          // アップロード済みファイルをクリア
          delete table.uploadedFiles;
        }
      }

      await updateSeatingJSON();

      showStatus('✅ 席次表を保存しました！', 'success');

      // データを再読み込み
      await loadSeatingData();

      // 選択中のテーブルがあれば再表示
      if (selectedTableId) {
        const table = seatingData.tables.find(t => t.id === selectedTableId);
        renderSelectedTablePreview(table ? table.images : []);
      }

    } catch (error) {
      showStatus('エラーが発生しました: ' + error.message, 'error');
      console.error(error);
    }
  }

  // 席次表JSONを更新
  async function updateSeatingJSON() {
    let sha = null;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${SEATING_DATA_PATH}`,
        { headers: { 'Authorization': `token ${githubToken}` } }
      );
      const data = await response.json();
      sha = data.sha;
    } catch (error) {
      // ファイルが存在しない場合は新規作成
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(seatingData, null, 2))));

    const body = {
      message: '席次表データを更新',
      content: content,
      branch: BRANCH
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${SEATING_DATA_PATH}`,
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

  // 起動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
