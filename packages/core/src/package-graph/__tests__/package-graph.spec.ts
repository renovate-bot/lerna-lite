import { RawManifest } from '../../models';
import { Package } from '../../package';
import { PackageGraphNode } from '../lib/package-graph-node';

// file under test
import { PackageGraph } from '../package-graph';

describe('PackageGraph', () => {
  describe('constructor', () => {
    it('throws an error when duplicate package names are present', () => {
      const pkgs = [
        new Package({ name: 'pkg-1', version: '1.0.0' } as Package, '/test/pkg-1', '/test'),
        new Package({ name: 'pkg-2', version: '2.0.0' } as Package, '/test/pkg-2', '/test'),
        new Package({ name: 'pkg-2', version: '3.0.0' } as Package, '/test/pkg-3', '/test'),
      ];

      expect(() => new PackageGraph(pkgs)).toThrowErrorMatchingInlineSnapshot(`
        "Package name "pkg-2" used in multiple packages:
        	/test/pkg-2
        	/test/pkg-3"
      `);
    });

    it('externalizes non-satisfied semver of local sibling', () => {
      const pkgs = [
        new Package(
          {
            name: 'pkg-1',
            version: '1.0.0',
            optionalDependencies: {
              // non-circular external
              'pkg-2': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-1'
        ),
        new Package(
          {
            name: 'pkg-2',
            version: '2.0.0',
            devDependencies: {
              'pkg-1': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-2'
        ),
        new Package(
          {
            name: 'pkg-3',
            version: '3.0.0',
            dependencies: {
              'pkg-2': '^2.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-3'
        ),
      ];
      const graph = new PackageGraph(pkgs);

      expect(graph.get('pkg-1')!.externalDependencies.has('pkg-2')).toBe(true);
      expect(graph.get('pkg-2')!.localDependents.has('pkg-1')).toBe(false);
      expect(graph.get('pkg-2')!.localDependencies.has('pkg-1')).toBe(true);
      expect(graph.get('pkg-3')!.localDependencies.has('pkg-2')).toBe(true);
    });

    it('localizes all non-satisfied siblings when forced', () => {
      const pkgs = [
        new Package(
          {
            name: 'pkg-1',
            version: '1.0.0',
          } as unknown as RawManifest,
          '/test/pkg-1'
        ),
        new Package(
          {
            name: 'pkg-2',
            version: '2.0.0',
            dependencies: {
              // non-circular external
              'pkg-1': '^2.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-2'
        ),
      ];
      const graph = new PackageGraph(pkgs, 'allDependencies', true);
      const [pkg1, pkg2] = graph.values();

      expect(pkg1.localDependents.has('pkg-2')).toBe(true);
      expect(pkg2.localDependencies.has('pkg-1')).toBe(true);
    });

    it('only localizes workspace: siblings when it must be explicit', () => {
      const pkgs = [
        new Package(
          {
            name: 'pkg-1',
            version: '1.0.0',
          } as unknown as RawManifest,
          '/test/pkg-1'
        ),
        new Package(
          {
            name: 'pkg-2',
            version: '1.0.0',
            dependencies: {
              'pkg-1': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-2'
        ),
        new Package(
          {
            name: 'pkg-3',
            version: '1.0.0',
            dependencies: {
              'pkg-1': 'workspace:^1.0.0',
            },
            peerDependencies: {
              'pkg-1': 'workspace:^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-3'
        ),
        new Package(
          {
            name: 'pkg-4',
            version: '1.0.0',
            dependencies: {
              'pkg-1': 'workspace:*',
            },
          } as unknown as RawManifest,
          '/test/pkg-4'
        ),
        new Package(
          {
            name: 'pkg-5',
            version: '1.0.0',
            dependencies: {
              'pkg-1': 'workspace:^',
              'pkg-2': 'workspace:~',
              'pkg-3': 'workspace:^1.0.0',
              'pkg-4': 'workspace:>=1.0.0',
            },
            peerDependencies: {
              'pkg-1': 'workspace:^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-5'
        ),
      ];

      const graph = new PackageGraph(pkgs, 'allDependencies', 'explicit');
      const [pkg1, pkg2, pkg3, pkg4, pkg5] = graph.values();

      expect(pkg1.localDependents.has('pkg-2')).toBe(false);
      expect(pkg2.localDependencies.has('pkg-1')).toBe(false);
      expect(pkg1.localDependents.has('pkg-3')).toBe(true);
      expect(pkg3.localDependencies.has('pkg-1')).toBe(true);
      expect(pkg4.localDependencies.has('pkg-1')).toBe(true);
      expect(pkg4.localDependencies.get('pkg-1').workspaceSpec).toBe('workspace:*');
      expect(pkg5.localDependencies.has('pkg-1')).toBe(true);
      expect(pkg5.localDependencies.has('pkg-2')).toBe(true);
      expect(pkg5.localDependencies.get('pkg-1').workspaceSpec).toBe('workspace:^');
      expect(pkg5.localDependencies.get('pkg-2').workspaceSpec).toBe('workspace:~');
      expect(pkg5.localDependencies.get('pkg-3').workspaceSpec).toBe('workspace:^1.0.0');
      expect(pkg5.localDependencies.get('pkg-4').workspaceSpec).toBe('workspace:>=1.0.0');
    });
  });

  describe('Node', () => {
    it('proxies Package properties', () => {
      const pkg = new Package({ name: 'my-pkg', version: '1.2.3' } as unknown as RawManifest, '/path/to/my-pkg');
      const graph = new PackageGraph([pkg]);
      const node = graph.get('my-pkg') as PackageGraphNode;

      // most of these properties are non-enumerable, so a snapshot doesn't work
      expect(node.name).toBe('my-pkg');
      expect(node.location).toBe('/path/to/my-pkg');
      expect(node.prereleaseId).toBeUndefined();
      expect(node.version).toBe('1.2.3');
      expect(node.pkg).toBe(pkg);
    });

    it('exposes graph-specific Map properties', () => {
      const node = new PackageGraph([
        new Package({ name: 'my-pkg', version: '4.5.6' } as unknown as RawManifest, '/path/to/my-pkg'),
      ]).get('my-pkg');

      expect(node).toHaveProperty('externalDependencies', expect.any(Map));
      expect(node).toHaveProperty('localDependencies', expect.any(Map));
      expect(node).toHaveProperty('localDependents', expect.any(Map));
    });

    it('computes prereleaseId from prerelease version', () => {
      const node = new PackageGraph([
        new Package({ name: 'my-pkg', version: '1.2.3-rc.4' } as unknown as RawManifest, '/path/to/my-pkg'),
      ]).get('my-pkg') as PackageGraphNode;

      expect(node.prereleaseId).toBe('rc');
    });

    describe('.toString()', () => {
      it("returns the node's name", () => {
        const node = new PackageGraph([
          new Package({ name: 'pkg-name', version: '0.1.2' } as unknown as RawManifest, '/path/to/pkg-name'),
        ]).get('pkg-name') as PackageGraphNode;

        expect(node.toString()).toBe('pkg-name');
      });
    });
  });

  describe('.get()', () => {
    it('should return a node with localDependencies', () => {
      const packages = [
        new Package(
          {
            name: 'my-package-1',
            version: '1.0.0',
            dependencies: {
              'external-thing': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-1'
        ),
        new Package(
          {
            name: 'my-package-2',
            version: '1.0.0',
            devDependencies: {
              'my-package-1': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-2'
        ),
      ];
      const graph = new PackageGraph(packages, 'allDependencies');

      expect(graph.get('my-package-1')!.localDependencies.size).toBe(0);
      expect(graph.get('my-package-2')!.localDependencies.has('my-package-1')).toBe(true);
    });

    it('should skip gitCommittish of packages that are not in localDependencies', () => {
      const packages = [
        new Package(
          {
            name: 'my-package-1',
            version: '1.0.0',
            devDependencies: {
              'my-package-2': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-1'
        ),
        new Package(
          {
            name: 'my-package-2',
            version: '1.0.0',
            dependencies: {
              'external-thing': 'github:user-foo/project-foo#v1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-2'
        ),
      ];
      const graph = new PackageGraph(packages, 'dependencies');

      expect(graph.get('my-package-1')!.localDependencies.size).toBe(0);
      expect(graph.get('my-package-2')!.localDependencies.size).toBe(0);
    });

    it('should return the localDependencies for matched gitCommittish', () => {
      const packages = [
        new Package(
          {
            name: 'my-package-1',
            version: '1.0.0',
            dependencies: {
              'external-thing': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-1'
        ),
        new Package(
          {
            name: 'my-package-2',
            version: '1.0.0',
            devDependencies: {
              'my-package-1': 'github:user-foo/project-foo#v1.0.0',
            },
          } as unknown as RawManifest,
          '/path/to/package-2'
        ),
      ];
      const graph = new PackageGraph(packages);

      expect(graph.get('my-package-2')!.localDependencies.has('my-package-1')).toBe(true);
    });
  });

  describe('.rawPackageList', () => {
    it('retuns an array of Package instances', () => {
      const pkgs = [
        new Package({ name: 'pkg-1', version: '1.0.0' } as unknown as RawManifest, '/test/pkg-1', '/test'),
        new Package({ name: 'pkg-2', version: '2.0.0' } as unknown as RawManifest, '/test/pkg-2', '/test'),
      ];
      const graph = new PackageGraph(pkgs);

      expect(graph.rawPackageList).toEqual(pkgs);
    });
  });

  describe.each`
    method               | filtered     | expected
    ${'addDependencies'} | ${['pkg-a']} | ${['pkg-a', 'pkg-b']}
    ${'addDependents'}   | ${['pkg-d']} | ${['pkg-d', 'pkg-c']}
  `('.$method()', ({ method, filtered, expected }) => {
    it(`extends ${filtered} to ${expected}`, () => {
      const pkgs = [
        { name: 'pkg-a', version: '1.0.0', dependencies: { 'pkg-b': '1.0.0' } },
        { name: 'pkg-b', version: '1.0.0', dependencies: {} },
        { name: 'pkg-c', version: '1.0.0', dependencies: { 'pkg-d': '1.0.0' } },
        { name: 'pkg-d', version: '1.0.0', dependencies: { 'pkg-c': '1.0.0' } },
        // cycle c <-> d catches nested search.add()
      ].map((json) => new Package(json as unknown as RawManifest, `/test/${json.name}`, '/test'));
      const graph = new PackageGraph(pkgs);

      const search = filtered.map((name) => graph.get(name)!.pkg);
      const result = graph[method](search);

      expect(result.map((pkg) => pkg.name)).toEqual(expected);
    });
  });

  describe('.partitionCycles()', () => {
    it('does not mutate or collapse a graph with no cycles', () => {
      const pkgs = [
        new Package(
          {
            name: 'pkg-1',
            version: '1.0.0',
          } as unknown as RawManifest,
          '/test/pkg-1'
        ),
        new Package(
          {
            name: 'pkg-2',
            version: '2.0.0',
            dependencies: {
              'pkg-1': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-2'
        ),
      ];
      const graph = new PackageGraph(pkgs);
      const [paths, nodes] = graph.partitionCycles();
      const cycles = graph.collapseCycles();

      expect(graph.size).toBe(2);
      expect(paths.size).toBe(0);
      expect(nodes.size).toBe(0);
      expect(Array.from(cycles).length).toBe(0);
    });
  });

  describe('.pruneCycleNodes()', () => {
    it('prunes direct cycles from the graph', () => {
      const pkgs = [
        new Package(
          {
            name: 'pkg-1',
            version: '1.0.0',
            dependencies: {
              'pkg-2': '^2.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-1'
        ),
        new Package(
          {
            name: 'pkg-2',
            version: '2.0.0',
            dependencies: {
              'pkg-1': '^1.0.0',
            },
          } as unknown as RawManifest,
          '/test/pkg-2'
        ),
      ];
      const graph = new PackageGraph(pkgs);
      const cycles = graph.collapseCycles();

      const [paths, nodes] = graph.partitionCycles();
      graph.pruneCycleNodes(nodes as Set<PackageGraphNode>);

      expect(graph.size).toBe(0);
      expect(nodes.size).toBe(2);
      expect(Array.from(cycles).length).toBe(1);
      expect(paths).toMatchInlineSnapshot(`
        Set {
          [
            "pkg-1",
            "pkg-2",
            "pkg-1",
          ],
          [
            "pkg-2",
            "pkg-1",
            "pkg-2",
          ],
        }
      `);
    });

    it('prunes all cycles from the graph, retaining non-cycles', () => {
      const pkgs = topoPackages();
      const graph = new PackageGraph(pkgs);
      const [paths, nodes] = graph.partitionCycles();
      graph.pruneCycleNodes(nodes as any);

      expect(Array.from(graph.keys())).toMatchInlineSnapshot(`
        [
          "dag-1",
          "dag-2a",
          "dag-2b",
          "dag-3",
          "standalone",
        ]
      `);
      expect(Array.from(nodes.keys() as any).map((node: any) => node.name)).toMatchInlineSnapshot(`
        [
          "cycle-1",
          "cycle-2",
          "cycle-tiebreaker",
        ]
      `);
      expect(paths).toMatchInlineSnapshot(`
        Set {
          [
            "cycle-1",
            "cycle-2",
            "cycle-1",
          ],
          [
            "cycle-2",
            "cycle-1",
            "cycle-2",
          ],
          [
            "cycle-tiebreaker",
            "cycle-1",
            "cycle-2",
            "cycle-1",
          ],
        }
      `);
    });
  });
});

function topoPackages() {
  return [
    {
      name: 'cycle-1',
      version: '1.0.0',
      dependencies: {
        'cycle-2': '1.0.0',
      },
    },
    {
      name: 'cycle-2',
      version: '1.0.0',
      dependencies: {
        'cycle-1': '1.0.0',
      },
    },
    {
      name: 'cycle-tiebreaker',
      version: '1.0.0',
      description: 'Breaks ties between cycle-{1,2} when batching.',
      dependencies: {
        'cycle-1': '1.0.0',
      },
    },
    {
      name: 'dag-1',
      version: '1.0.0',
    },
    {
      name: 'dag-2a',
      version: '1.0.0',
      dependencies: {
        'dag-1': '1.0.0',
      },
    },
    {
      name: 'dag-2b',
      version: '1.0.0',
      dependencies: {
        'dag-1': '1.0.0',
      },
    },
    {
      name: 'dag-3',
      version: '1.0.0',
      dependencies: {
        'dag-2a': '1.0.0',
        'dag-1': '1.0.0',
      },
    },
    {
      name: 'standalone',
      version: '1.0.0',
    },
  ].map((json) => new Package(json as unknown as RawManifest, `/test/${json.name}`, '/test'));
}
