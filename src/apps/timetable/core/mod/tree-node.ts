export interface Terminable {
  isTerminated(): boolean;
}

export class TreeNode<T extends Terminable> {
  public children: TreeNode<T>[] = [];

  constructor(public value: T) {}

  /**
   * 특정 로직(logic)에 따라 자식 노드를 재귀적으로 추가한다.
   * @param logic - 현재 노드와 현재 깊이를 받아, 추가할 자식 노드의 value 배열을 반환하는 함수.
   *                반환 값이 없거나 빈 배열이면 자식 노드를 추가하지 않는다.
   * @param maxDepth - 추가 가능한 최대 깊이 (루트의 깊이를 1로 가정)
   * @param currentDepth - 현재 깊이 (기본값 1)
   */
  expand(
    logic: (node: TreeNode<T>, depth: number) => T[] | undefined,
    maxDepth: number,
    currentDepth: number = 1
  ): void {
    if (currentDepth >= maxDepth) {
      // 최대 깊이에 도달했으므로 더 이상 자식을 추가하지 않음.
      return;
    }

    if (this.value.isTerminated()) {
      return;
    }

    const newValues = logic(this, currentDepth);
    if (newValues && newValues.length > 0) {
      for (const val of newValues) {
        const child = new TreeNode<T>(val);
        child.expand(logic, maxDepth, currentDepth + 1);
        this.children.push(child);
      }
    }
  }

  /**
   * 트리 내의 리프(말단) 노드들만 모아서 반환한다.
   * @returns 리프 노드 배열
   */
  getLeafNodes(): TreeNode<T>[] {
    if (this.children.length === 0) {
      return [this];
    }

    let leaves: TreeNode<T>[] = [];
    for (const child of this.children) {
      leaves = leaves.concat(child.getLeafNodes());
    }
    return leaves;
  }

  /**
   * 모든 루트-리프 경로를 반환한다.
   * 각 경로는 루트부터 해당 리프까지의 TreeNode<T> 배열로 표현된다.
   * @param path - 현재까지 누적된 경로 (재귀용 내부 인자)
   * @returns 모든 경로의 배열
   */
  getAllPaths(path: TreeNode<T>[] = []): TreeNode<T>[][] {
    const currentPath = [...path, this];

    // 리프 노드인 경우 현재까지의 경로를 반환
    if (this.children.length === 0) {
      return [currentPath];
    }

    // 자식 노드 각각에 대해 경로를 재귀적으로 모은다.
    let paths: TreeNode<T>[][] = [];
    for (const child of this.children) {
      paths = paths.concat(child.getAllPaths(currentPath));
    }
    return paths;
  }

  /**
   * 루트-리프 경로 중, 전체 깊이가 minDepth 이하인 경로를 제거한다.
   * (경로가 minDepth 이하이면 해당 리프 노드를 부모의 자식 목록에서 제거)
   * @param minDepth - 최소 깊이 (루트의 깊이를 1로 가정)
   * @param currentDepth - 현재 깊이 (기본값 1)
   * @returns 현재 노드를 제거해야 하면 true, 그렇지 않으면 false.
   */
  pruneShallowPaths(minDepth: number, currentDepth: number = 1): boolean {
    if (this.children.length === 0) {
      return currentDepth <= minDepth;
    }

    this.children = this.children.filter(
      (child) => !child.pruneShallowPaths(minDepth, currentDepth + 1)
    );

    if (this.children.length === 0) {
      return currentDepth <= minDepth;
    }
    return false;
  }

  /**
   * 리프 노드가 특정 조건을 만족하는 경우, 해당 루트-리프 경로를 제거한다.
   * @param condition - 리프 노드를 인자로 받아 조건 만족 여부를 반환하는 함수.
   * @param currentDepth - 현재 깊이 (기본값 1)
   * @returns 현재 노드를 제거해야 하면 true, 그렇지 않으면 false.
   */
  pruneLeafPathsByCondition(
    condition: (leaf: TreeNode<T>) => boolean,
    currentDepth: number = 1
  ): boolean {
    if (this.children.length === 0) {
      return condition(this);
    }

    this.children = this.children.filter(
      (child) => !child.pruneLeafPathsByCondition(condition, currentDepth + 1)
    );
    return false;
  }
}
