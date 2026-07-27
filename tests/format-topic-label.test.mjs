import assert from "node:assert/strict";
import test from "node:test";
import { formatTopicLabel } from "../src/lib/utils/formatTopic.ts";

test("formatTopicLabel capitalizes first letter and lowercases subsequent letters", () => {
  assert.equal(formatTopicLabel("LINUX TIPS"), "Linux tips");
  assert.equal(formatTopicLabel("service mesh"), "Service mesh");
  assert.equal(formatTopicLabel("KUBERNETES"), "Kubernetes");
  assert.equal(formatTopicLabel("terraform"), "Terraform");
});

test("formatTopicLabel preserves acronyms", () => {
  assert.equal(formatTopicLabel("AWS"), "AWS");
  assert.equal(formatTopicLabel("aws"), "AWS");
  assert.equal(formatTopicLabel("ci/cd"), "CI/CD");
  assert.equal(formatTopicLabel("k8s"), "K8S");
});
