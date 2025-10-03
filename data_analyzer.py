#!/usr/bin/env python3
"""
Data Analyzer - CSV分析ツール
Author: Your Name
License: MIT
"""

import pandas as pd
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns

class DataAnalyzer:
    """CSVファイルを読み込んで統計分析を行うクラス"""
    
    def __init__(self, filepath):
        """
        初期化メソッド
        
        Args:
            filepath (str): 分析するCSVファイルのパス
        """
        self.filepath = filepath
        self.df = None
        self.stats = {}
        
    def load_data(self):
        """データを読み込む"""
        try:
            self.df = pd.read_csv(self.filepath)
            print(f"✓ データ読み込み完了: {len(self.df)} 行")
            return True
        except Exception as e:
            print(f"✗ エラー: {e}")
            return False
    
    def basic_stats(self):
        """基本統計量を計算"""
        if self.df is None:
            print("先にload_data()を実行してください")
            return
        
        self.stats = {
            'rows': len(self.df),
            'columns': len(self.df.columns),
            'missing': self.df.isnull().sum().sum(),
            'memory_usage': self.df.memory_usage(deep=True).sum() / 1024**2
        }
        
        print("\n=== 基本統計 ===")
        print(f"行数: {self.stats['rows']:,}")
        print(f"列数: {self.stats['columns']}")
        print(f"欠損値: {self.stats['missing']}")
        print(f"メモリ使用量: {self.stats['memory_usage']:.2f} MB")
        
        return self.stats
    
    def detect_outliers(self, column, method='iqr'):
        """外れ値を検出
        
        Args:
            column (str): 対象の列名
            method (str): 検出方法 ('iqr' or 'zscore')
        
        Returns:
            pd.Series: 外れ値のブール配列
        """
        if method == 'iqr':
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            outliers = (self.df[column] < Q1 - 1.5 * IQR) | (self.df[column] > Q3 + 1.5 * IQR)
        elif method == 'zscore':
            z_scores = np.abs((self.df[column] - self.df[column].mean()) / self.df[column].std())
            outliers = z_scores > 3
        else:
            raise ValueError("method は 'iqr' または 'zscore' を指定してください")
        
        print(f"\n外れ値検出 ({column}): {outliers.sum()} 件")
        return outliers
    
    def visualize_distribution(self, column, save_path=None):
        """分布を可視化
        
        Args:
            column (str): 対象の列名
            save_path (str, optional): 保存先パス
        """
        fig, axes = plt.subplots(1, 2, figsize=(12, 4))
        
        # ヒストグラム
        axes[0].hist(self.df[column].dropna(), bins=30, edgecolor='black', alpha=0.7)
        axes[0].set_title(f'{column} の分布')
        axes[0].set_xlabel(column)
        axes[0].set_ylabel('頻度')
        
        # ボックスプロット
        axes[1].boxplot(self.df[column].dropna())
        axes[1].set_title(f'{column} のボックスプロット')
        axes[1].set_ylabel(column)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"✓ グラフ保存: {save_path}")
        else:
            plt.show()
    
    def export_report(self, output_file='report.txt'):
        """分析レポートをエクスポート"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"データ分析レポート\n")
            f.write(f"生成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"{'='*50}\n\n")
            
            if self.stats:
                f.write("基本統計:\n")
                for key, value in self.stats.items():
                    f.write(f"  {key}: {value}\n")
            
            f.write(f"\n{'='*50}\n")
            f.write("記述統計:\n")
            f.write(self.df.describe().to_string())
        
        print(f"✓ レポート出力: {output_file}")

def main():
    """メイン処理"""
    print("Data Analyzer v1.0")
    print("=" * 50)
    
    # 使用例
    analyzer = DataAnalyzer('sample_data.csv')
    
    if analyzer.load_data():
        analyzer.basic_stats()
        # analyzer.detect_outliers('price')
        # analyzer.visualize_distribution('price')
        # analyzer.export_report()

if __name__ == "__main__":
    main()
