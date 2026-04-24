const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => {
    try {
        let data = req.body.data;
        if (!Array.isArray(data)) {
            data = [];
        }

        let invalidEntries = [];
        let seenEdges = new Set();
        let dupEdges = new Set();
        let parentOf = {};
        let childrenOf = {};
        let nodes = new Set();

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (typeof item !== 'string') {
                invalidEntries.push(String(item));
                continue;
            }
            let val = item.trim();
            
            // valid node format checking via regex
            if (!/^[A-Z]->[A-Z]$/.test(val)) {
                invalidEntries.push(item);
                continue;
            }
            
            let a = val[0];
            let b = val[3];
            
            // here we are handling self-loops
            if (a === b) {
                invalidEntries.push(item);
                continue;
            }
            
            // we are handling and tracking duplicates 
            if (seenEdges.has(val)) {
                dupEdges.add(val);
                continue;
            }
            seenEdges.add(val);
            
            // first parent wins rule for multi parent cases
            if (!parentOf[b]) {
                parentOf[b] = a;
                if (!childrenOf[a]) childrenOf[a] = [];
                childrenOf[a].push(b);
                nodes.add(a);
                nodes.add(b);
            }
        }

        let remainingNodes = new Set(nodes);
        let roots = [];
        
        // here we are finding roots i.e nodes with no parents
        for (let n of remainingNodes) {
            if (!parentOf[n]) {
                roots.push(n);
            }
        }

        let trees = [];
        let cycles = [];

        // recursively building tree objects
        function buildTree(n, visited) {
            visited.push(n);
            let obj = {};
            if (childrenOf[n]) {
                let children = childrenOf[n].slice().sort();
                for (let c of children) {
                    let childTree = buildTree(c, visited);
                    obj[c] = childTree[c];
                }
            }
            let res = {};
            res[n] = obj;
            return res;
        }

        function getDepth(n) {
            if (!childrenOf[n] || childrenOf[n].length === 0) return 1;
            let maxD = 0;
            for (let c of childrenOf[n]) {
                maxD = Math.max(maxD, getDepth(c));
            }
            return maxD + 1;
        }

        for (let r of roots) {
            let visited = [];
            let treeObj = buildTree(r, visited);
            let d = getDepth(r);
            trees.push({ root: r, tree: treeObj, depth: d });
            for (let v of visited) {
                remainingNodes.delete(v);
            }
        }

        // making sure no cycles or extra nodes are left
        while (remainingNodes.size > 0) {
            let start = Array.from(remainingNodes)[0];
            let comp = new Set();
            let q = [start];
            comp.add(start);
            while (q.length > 0) {
                let curr = q.shift();
                remainingNodes.delete(curr);
                let neighbors = [];
                if (parentOf[curr]) neighbors.push(parentOf[curr]);
                if (childrenOf[curr]) neighbors.push(...childrenOf[curr]);
                for (let nxt of neighbors) {
                    if (!comp.has(nxt)) {
                        comp.add(nxt);
                        q.push(nxt);
                    }
                }
            }
            let minNode = Array.from(comp).sort()[0];
            cycles.push({ root: minNode, tree: {}, has_cycle: true });
        }

        // finding largest tree for summary
        let maxDepth = 0;
        let bigRoot = "";
        for (let t of trees) {
            if (t.depth > maxDepth) {
                maxDepth = t.depth;
                bigRoot = t.root;
            } else if (t.depth === maxDepth) {
                if (bigRoot === "" || t.root < bigRoot) {
                    bigRoot = t.root;
                }
            }
        }

        let hierarchies = [];
        for(let t of trees) hierarchies.push(t);
        for(let c of cycles) hierarchies.push(c);

        res.json({
          user_id: "anudeep_muppalla_29062006",
          email_id: "anudeep_muppalla@srmap.edu.in",
          college_roll_number: "AP23110011278",
          hierarchies: hierarchies,
          invalid_entries: invalidEntries,
          duplicate_edges: Array.from(dupEdges),
          summary: {
            total_trees: trees.length,
            total_cycles: cycles.length,
            largest_tree_root: bigRoot,
          },
        });
    } catch (e) {
        res.status(500).json({ error: "error" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
