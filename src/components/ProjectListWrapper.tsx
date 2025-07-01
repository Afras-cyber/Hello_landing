
import React from 'react';
import ProjectList from './ProjectList';

interface ProjectListWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
    show_more_button_text?: string;
    show_more_button_url?: string;
  };
}

const ProjectListWrapper: React.FC<ProjectListWrapperProps> = ({ content }) => {
  // For now, just render the original ProjectList component
  // In the future, this can be enhanced to use the content props
  return <ProjectList />;
};

export default ProjectListWrapper;
