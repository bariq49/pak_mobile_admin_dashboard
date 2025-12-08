"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center mb-3 border-none">
        <CardTitle className="text-lg font-medium text-default-800">
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-default-600 mb-3">
          Being an effective administrator is all about simplicity and clarity —
          just like a well-structured system, it should feel effortless to
          navigate. To a new team member, great administration might seem like
          basic organization, but in reality, it’s a carefully balanced
          structure built on communication, precision, and adaptability.
        </div>
        <div className="text-sm text-default-600">
          You always want to make sure that your processes work well together
          and try to limit unnecessary complexity. Experiment and refine your
          workflow using the tools you already have access to — from scheduling
          platforms to document management systems. This is one of the most
          valuable lessons I’ve learned from experienced administrators. They
          emphasize efficiency, balance, and consistency. Use a variety of
          organizational tools to enhance your work, but avoid overcomplicating
          your systems. The key to great administration is coordination, not
          clutter.
        </div>
      </CardContent>
    </Card>
  );
};

export default About;
