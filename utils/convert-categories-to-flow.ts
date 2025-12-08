import { Node, Edge } from "reactflow";
import { Category } from "@/api/categories/categories.api";

export const buildCategoryTree = (categories: Category[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const addNode = (category: Category, parentId?: string) => {
    nodes.push({
      id: category._id,
      data: { label: category.name },
      position: { x: 0, y: 0 },
      type: parentId ? undefined : "input",
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${category._id}`,
        source: parentId,
        target: category._id,
        type: "smoothstep",
        animated: true,
      });
    }

    if (category.children?.length) {
      category.children.forEach((child) => addNode(child, category._id));
    }
  };

  categories.forEach((c) => addNode(c));
  return { nodes, edges };
};
