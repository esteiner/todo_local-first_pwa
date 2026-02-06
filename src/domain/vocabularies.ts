/**
 * Domain Layer: RDF Vocabularies
 *
 * Defines the semantic web vocabularies used for task representation.
 * Uses standard RDF, RDFS, and custom TODO ontology.
 */

import { Namespace } from 'rdflib';

// Standard RDF vocabularies
export const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
export const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#');
export const XSD = Namespace('http://www.w3.org/2001/XMLSchema#');
export const DCTERMS = Namespace('http://purl.org/dc/terms/');

// Custom TODO vocabulary
export const TODO = Namespace('http://example.org/todo#');

/**
 * RDF Types used in the task knowledge graph
 */
export const Types = {
  Task: TODO('Task'),
  CompletedTask: TODO('CompletedTask'),
  PendingTask: TODO('PendingTask'),
};

/**
 * RDF Properties for tasks
 */
export const Properties = {
  // Task content
  title: TODO('title'),
  description: TODO('description'),

  // Task status
  completed: TODO('completed'),

  // Timestamps
  created: DCTERMS('created'),
  modified: DCTERMS('modified'),
  completedAt: TODO('completedAt'),

  // Identifiers
  id: TODO('id'),
};
