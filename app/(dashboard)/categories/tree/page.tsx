"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  OnConnect,
  Node,
  Edge,
} from "reactflow";

import dagre from "dagre";
import "reactflow/dist/style.css";
import { useGetCategoriesQuery } from "@/hooks/api/use-categories-api";
import { buildCategoryTree } from "@/utils/convert-categories-to-flow";


const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
      };
    }),
    edges,
  };
};

const DagreeTree = () => {
  const { data, isLoading } = useGetCategoriesQuery({ page: 1, limit: 100 });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data?.data?.categories) return;

    const { nodes: rawNodes, edges: rawEdges } = buildCategoryTree(
      data.data.categories
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      "TB"
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );

  const onLayout = (direction: string) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories Tree</CardTitle>
      </CardHeader>

      <CardContent className="overflow-auto">
        <div className="w-full h-[calc(100vh-280px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            connectionLineType={ConnectionLineType.SmoothStep}
          >
            <Panel position="top-right">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onLayout("TB")}>
                  Vertical Layout
                </Button>
                <Button variant="outline" onClick={() => onLayout("LR")}>
                  Horizontal Layout
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

export default DagreeTree;
