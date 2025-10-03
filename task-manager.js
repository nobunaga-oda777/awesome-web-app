/**
 * TaskManager - シンプルなタスク管理アプリ
 * @version 1.2.0
 * @author Your Name
 */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
    this.filters = {
      status: 'all',
      priority: 'all'
    };
    this.init();
  }

  /**
   * 初期化処理
   */
  init() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.render();
    console.log('TaskManager initialized:', this.tasks.length, 'tasks loaded');
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    const addBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addTask());
    }
    
    if (taskInput) {
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTask();
      });
    }

    // フィルターボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });
  }

  /**
   * 新しいタスクを追加
   * @param {string} title - タスクのタイトル
   * @param {string} priority - 優先度 (low/medium/high)
   * @returns {Object} 作成されたタスク
   */
  addTask(title = null, priority = 'medium') {
    const taskInput = document.getElementById('taskInput');
    const taskTitle = title || taskInput?.value.trim();

    if (!taskTitle) {
      this.showNotification('タスク名を入力してください', 'warning');
      return null;
    }

    const task = {
      id: this.nextId++,
      title: taskTitle,
      completed: false,
      priority: priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(task);
    this.saveToStorage();
    this.render();

    if (taskInput) taskInput.value = '';
    this.showNotification('タスクを追加しました', 'success');
    
    return task;
  }

  /**
   * タスクを削除
   * @param {number} id - タスクID
   */
  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.error('Task not found:', id);
      return;
    }

    this.tasks.splice(index, 1);
    this.saveToStorage();
    this.render();
    this.showNotification('タスクを削除しました', 'info');
  }

  /**
   * タスクの完了状態をトグル
   * @param {number} id - タスクID
   */
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      console.error('Task not found:', id);
      return;
    }

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    this.saveToStorage();
    this.render();
  }

  /**
   * タスクの優先度を変更
   * @param {number} id - タスクID
   * @param {string} priority - 新しい優先度
   */
  updatePriority(id, priority) {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) return;

    task.priority = priority;
    task.updatedAt = new Date().toISOString();
    this.saveToStorage();
    this.render();
  }

  /**
   * フィルターを設定
   * @param {string} filterType - フィルタータイプ
   */
  setFilter(filterType) {
    this.filters.status = filterType;
    this.render();
  }

  /**
   * フィルター済みタスクを取得
   * @returns {Array} フィルターされたタスク配列
   */
  getFilteredTasks() {
    return this.tasks.filter(task => {
      if (this.filters.status === 'active') return !task.completed;
      if (this.filters.status === 'completed') return task.completed;
      return true; // 'all'
    });
  }

  /**
   * 統計情報を取得
   * @returns {Object} 統計データ
   */
  getStats() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.completed).length,
      active: this.tasks.filter(t => !t.completed).length,
      highPriority: this.tasks.filter(t => t.priority === 'high' && !t.completed).length
    };
  }

  /**
   * タスクをレンダリング
   */
  render() {
    const container = document.getElementById('taskList');
    if (!container) return;

    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      container.innerHTML = '<div class="empty-state">タスクがありません</div>';
      this.updateStats();
      return;
    }

    container.innerHTML = filteredTasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" 
               class="task-checkbox" 
               ${task.completed ? 'checked' : ''}
               onchange="taskManager.toggleTask(${task.id})">
        <span class="task-title">${this.escapeHtml(task.title)}</span>
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">×</button>
      </div>
    `).join('');

    this.updateStats();
  }

  /**
   * 統計表示を更新
   */
  updateStats() {
    const stats = this.getStats();
    const statsEl = document.getElementById('stats');
    
    if (statsEl) {
      statsEl.innerHTML = `
        合計: ${stats.total} | 
        完了: ${stats.completed} | 
        未完了: ${stats.active} | 
        重要: ${stats.highPriority}
      `;
    }
  }

  /**
   * 通知を表示
   * @param {string} message - メッセージ
   * @param {string} type - タイプ (success/warning/info/error)
   */
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // 実際のUIに通知を表示する処理をここに追加
  }

  /**
   * HTMLエスケープ
   * @param {string} text - エスケープするテキスト
   * @returns {string} エスケープされたテキスト
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * データを保存
   */
  saveToStorage() {
    try {
      const data = {
        tasks: this.tasks,
        nextId: this.nextId,
        lastModified: new Date().toISOString()
      };
      // localStorage使用不可のため、メモリ上に保持
      this._storageCache = data;
      console.log('Data saved:', this.tasks.length, 'tasks');
    } catch (error) {
      console.error('Save error:', error);
    }
  }

  /**
   * データを読み込み
   */
  loadFromStorage() {
    try {
      if (this._storageCache) {
        this.tasks = this._storageCache.tasks || [];
        this.nextId = this._storageCache.nextId || 1;
        console.log('Data loaded:', this.tasks.length, 'tasks');
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  }

  /**
   * 全てのタスクをクリア
   */
  clearAll() {
    if (confirm('全てのタスクを削除しますか?')) {
      this.tasks = [];
      this.saveToStorage();
      this.render();
      this.showNotification('全てのタスクを削除しました', 'info');
    }
  }
}

// グローバルインスタンス
let taskManager;

// DOM読み込み完了後に初期化
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
  });
}

// モジュールとしてエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskManager;
}
